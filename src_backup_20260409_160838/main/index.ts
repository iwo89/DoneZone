import { app, BrowserWindow, nativeImage } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc'
import { startWatcher } from './fathomService'
import { startDueReminders } from './notifications'

if (process.platform === 'win32') {
  app.setAppUserModelId(app.name)
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
    backgroundColor: '#0d2055',
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.on('maximize', () => win.webContents.send('win:maximized', true))
  win.on('unmaximize', () => win.webContents.send('win:maximized', false))

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerIpcHandlers()
  startDueReminders()
  startWatcher()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
