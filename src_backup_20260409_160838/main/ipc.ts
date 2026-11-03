import { ipcMain, app, BrowserWindow, dialog } from 'electron'
import { getAllTasks, createTask, updateTask, deleteTask, markAsDone } from '../db/database'
import type { CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { FathomConfigInput } from '../types/fathom'
import { notifyTaskCreated } from './notifications'
import {
  startWatcher,
  restartWatcher,
  isWatcherActive,
  processFolder,
  setOnTasksCreated,
} from './fathomService'
import store from './store'

export function registerIpcHandlers(): void {
  ipcMain.handle('tasks:getAll', () => {
    return getAllTasks()
  })

  ipcMain.handle('tasks:create', (_event, input: CreateTaskInput) => {
    const task = createTask(input)
    notifyTaskCreated(task.title)
    return task
  })

  ipcMain.handle('tasks:update', (_event, id: number, updates: UpdateTaskInput) => {
    return updateTask(id, updates)
  })

  ipcMain.handle('tasks:delete', (_event, id: number) => {
    return deleteTask(id)
  })

  ipcMain.handle('tasks:markDone', (_event, id: number) => {
    return markAsDone(id)
  })

  ipcMain.handle('settings:getOpenAtLogin', () => {
    return app.getLoginItemSettings().openAtLogin
  })

  ipcMain.handle('settings:setOpenAtLogin', (_event, enabled: boolean) => {
    app.setLoginItemSettings({ openAtLogin: enabled })
  })

  ipcMain.handle('settings:getNotificationsEnabled', () => {
    return store.get('notificationsEnabled')
  })

  ipcMain.handle('settings:setNotificationsEnabled', (_event, enabled: boolean) => {
    store.set('notificationsEnabled', enabled)
  })

  ipcMain.handle('win:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('win:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  ipcMain.handle('win:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('win:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  setOnTasksCreated(() => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('fathom:tasksCreated')
    })
  })

  ipcMain.handle('fathom:getConfig', () => {
    return {
      userName: store.get('userName'),
      watchFolder: store.get('watchFolder'),
      aiProvider: store.get('aiProvider'),
      hasGeminiKey: store.get('geminiApiKey').length > 0,
      hasClaudeKey: store.get('claudeApiKey').length > 0,
    }
  })

  ipcMain.handle('fathom:setConfig', async (_event, input: FathomConfigInput) => {
    if (input.userName !== undefined)    store.set('userName', input.userName)
    if (input.watchFolder !== undefined) store.set('watchFolder', input.watchFolder)
    if (input.aiProvider !== undefined)  store.set('aiProvider', input.aiProvider)
    if (input.geminiApiKey !== undefined && input.geminiApiKey.length > 0) {
      store.set('geminiApiKey', input.geminiApiKey)
    }
    if (input.claudeApiKey !== undefined && input.claudeApiKey.length > 0) {
      store.set('claudeApiKey', input.claudeApiKey)
    }
    await restartWatcher()
  })

  ipcMain.handle('fathom:resetConfig', async () => {
    store.set('userName', '')
    store.set('geminiApiKey', '')
    store.set('claudeApiKey', '')
    store.set('aiProvider', 'gemini')
    store.set('watchFolder', '')
    await restartWatcher()
  })

  ipcMain.handle('fathom:browseFolder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: 'Select Fathom watch folder',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('fathom:processNow', async () => {
    return processFolder()
  })

  ipcMain.handle('fathom:isWatcherActive', () => {
    return isWatcherActive()
  })
}
