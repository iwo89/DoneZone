import { app, BrowserWindow, nativeImage, globalShortcut, Tray, Menu } from 'electron'
import path from 'path'
import { registerIpcHandlers, cleanupWindowState } from './ipc'
import { startDueReminders, stopDueReminders } from './notifications'
import { setupAutoUpdater } from './updater'
import store from './store'

if (process.platform === 'win32') {
  app.setAppUserModelId(app.name)
}

if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getAppPath(), '.dev-data'))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let forceQuit = false

function showWindow(): void {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function createTray(): void {
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)
  tray.setToolTip('DoneZone')

  const menu = Menu.buildFromTemplate([
    { label: 'Open DoneZone', click: () => showWindow() },
    {
      label: 'Add Task',
      click: () => {
        showWindow()
        mainWindow?.webContents.send('win:openAddTask')
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        forceQuit = true
        app.quit()
      },
    },
  ])

  tray.on('click', () => showWindow())
  tray.on('right-click', () => tray?.popUpContextMenu(menu))
}

function createWindow(): void {
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  const win = new BrowserWindow({
    icon,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 560,
    frame: false,
    show: false,
    backgroundColor: '#0d2055',
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow = win

  win.once('ready-to-show', () => {
    if (!process.argv.includes('--hidden')) win.show()
  })

  win.on('close', (e) => {
    if (!forceQuit && store.get('closeToTray')) {
      e.preventDefault()
      win.hide()
    }
  })

  win.on('closed', () => {
    cleanupWindowState(win.id)
    mainWindow = null
  })
  win.on('maximize', () => win.webContents.send('win:maximized', true))
  win.on('unmaximize', () => win.webContents.send('win:maximized', false))

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.on('before-quit', () => {
  forceQuit = true
})

app.on('second-instance', () => {
  showWindow()
})

app.whenReady().then(() => {
  registerIpcHandlers()
  setupAutoUpdater()
  startDueReminders()
  createTray()
  createWindow()

  const registered = globalShortcut.register('CommandOrControl+Alt+T', () => {
    showWindow()
    mainWindow?.webContents.send('win:openAddTask')
  })
  if (!registered) {
    console.warn('[Main] Global shortcut Ctrl+Alt+T is already in use by another application')
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  stopDueReminders()
  tray?.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
