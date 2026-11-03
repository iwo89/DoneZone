import { ipcMain, app, BrowserWindow, dialog, screen } from 'electron'
import fs from 'fs'
import {
  getAllTasks, createTask, updateTask, deleteTask, markAsDone, reorderTasks, importBackup,
  getAllTimerTasks, createTimerTask, updateTimerTask, deleteTimerTask, startTimer, stopTimer, markTimerDone, discardTimerRun,
} from '../db/database'
import type { CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { CreateTimerTaskInput, UpdateTimerTaskInput } from '../types/timer'
import { notifyTaskCreated } from './notifications'
import { checkForUpdates, installUpdate, getUpdaterState } from './updater'
import store from './store'

type PrevState = { bounds: Electron.Rectangle; maximized: boolean }
const prevStateMap = new Map<number, PrevState>()
let registered = false

export function cleanupWindowState(winId: number): void {
  prevStateMap.delete(winId)
}

export function registerIpcHandlers(): void {
  if (registered) return
  registered = true
  ipcMain.handle('tasks:getAll', () => {
    return getAllTasks()
  })

  ipcMain.handle('tasks:create', (_event, input: CreateTaskInput) => {
    if (!input?.title || typeof input.title !== 'string') throw new Error('Title is required')
    input.title = input.title.trim().slice(0, 500)
    if (!input.title) throw new Error('Title cannot be empty')
    if (input.description) input.description = input.description.slice(0, 5000)
    if (input.tags) input.tags = input.tags.slice(0, 20).map((t) => String(t).slice(0, 50))
    const task = createTask(input)
    notifyTaskCreated(task.title)
    return task
  })

  ipcMain.handle('tasks:update', (_event, id: number, updates: UpdateTaskInput) => {
    if (typeof id !== 'number') throw new Error('Invalid task id')
    if (updates.title !== undefined) {
      updates.title = String(updates.title).trim().slice(0, 500)
      if (!updates.title) throw new Error('Title cannot be empty')
    }
    if (updates.description) updates.description = updates.description.slice(0, 5000)
    if (updates.tags) updates.tags = updates.tags.slice(0, 20).map((t) => String(t).slice(0, 50))
    return updateTask(id, updates)
  })

  ipcMain.handle('tasks:delete', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid task id')
    return deleteTask(id)
  })

  ipcMain.handle('tasks:markDone', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid task id')
    return markAsDone(id)
  })

  ipcMain.handle('tasks:reorder', (_event, ids: number[]) => {
    if (!Array.isArray(ids)) throw new Error('ids must be an array')
    reorderTasks(ids)
  })

  ipcMain.handle('timer:getAll', () => {
    return getAllTimerTasks()
  })

  ipcMain.handle('timer:create', (_event, input: CreateTimerTaskInput) => {
    if (!input?.title || typeof input.title !== 'string') throw new Error('Title is required')
    input.title = input.title.trim().slice(0, 500)
    if (!input.title) throw new Error('Title cannot be empty')
    if (input.tag != null) input.tag = String(input.tag).trim().slice(0, 50) || null
    if (input.comments != null) input.comments = String(input.comments).slice(0, 5000) || null
    if (input.linked_task_id != null && (!Number.isInteger(input.linked_task_id) || input.linked_task_id <= 0)) throw new Error('Invalid linked task id')
    return createTimerTask(input)
  })

  ipcMain.handle('timer:update', (_event, id: number, updates: UpdateTimerTaskInput) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    if (updates.title !== undefined) {
      updates.title = String(updates.title).trim().slice(0, 500)
      if (!updates.title) throw new Error('Title cannot be empty')
    }
    if (updates.tag !== undefined && updates.tag !== null) {
      updates.tag = String(updates.tag).trim().slice(0, 50) || null
    }
    if (updates.comments !== undefined && updates.comments !== null) {
      updates.comments = String(updates.comments).slice(0, 5000) || null
    }
    return updateTimerTask(id, updates)
  })

  ipcMain.handle('timer:delete', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    return deleteTimerTask(id)
  })

  ipcMain.handle('timer:start', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    return startTimer(id)
  })

  ipcMain.handle('timer:stop', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    return stopTimer(id)
  })

  ipcMain.handle('timer:markDone', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    return markTimerDone(id)
  })

  ipcMain.handle('timer:discardRun', (_event, id: number) => {
    if (typeof id !== 'number') throw new Error('Invalid timer task id')
    return discardTimerRun(id)
  })

  ipcMain.handle('settings:getOpenAtLogin', () => {
    return app.getLoginItemSettings().openAtLogin
  })

  ipcMain.handle('settings:setOpenAtLogin', (_event, enabled: boolean) => {
    const startMinimized = store.get('startMinimized')
    app.setLoginItemSettings({
      openAtLogin: enabled,
      args: enabled && startMinimized ? ['--hidden'] : [],
    })
  })

  ipcMain.handle('settings:getNotificationsEnabled', () => {
    return store.get('notificationsEnabled')
  })

  ipcMain.handle('settings:setNotificationsEnabled', (_event, enabled: boolean) => {
    store.set('notificationsEnabled', enabled)
  })

  ipcMain.handle('settings:getCloseToTray', () => {
    return store.get('closeToTray')
  })

  ipcMain.handle('settings:setCloseToTray', (_event, enabled: boolean) => {
    store.set('closeToTray', enabled)
  })

  ipcMain.handle('settings:getStartMinimized', () => {
    return store.get('startMinimized')
  })

  ipcMain.handle('settings:setStartMinimized', (_event, enabled: boolean) => {
    store.set('startMinimized', enabled)
    const openAtLogin = app.getLoginItemSettings().openAtLogin
    if (openAtLogin) {
      app.setLoginItemSettings({
        openAtLogin: true,
        args: enabled ? ['--hidden'] : [],
      })
    }
  })

  ipcMain.handle('settings:getWidgetAlwaysOnTop', () => {
    return store.get('widgetAlwaysOnTop')
  })

  ipcMain.handle('settings:setWidgetAlwaysOnTop', (_event, enabled: boolean) => {
    store.set('widgetAlwaysOnTop', enabled)
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

  ipcMain.handle('win:enterWidget', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    prevStateMap.set(win.id, { bounds: win.getBounds(), maximized: win.isMaximized() })
    if (win.isMaximized()) win.unmaximize()
    const { width: sw, height: sh, x: ox, y: oy } = screen.getPrimaryDisplay().workArea
    const w = Math.round(sw * 0.28)
    const h = Math.round(sh * 0.65)
    win.setMinimumSize(300, 200)
    win.setAlwaysOnTop(store.get('widgetAlwaysOnTop'), 'floating')
    win.setBounds({ x: ox + sw - w - 20, y: oy + sh - h - 20, width: w, height: h })
    win.webContents.send('win:widgetMode', true)
  })

  ipcMain.handle('win:exitWidget', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    win.setAlwaysOnTop(false)
    win.setMinimumSize(800, 560)
    const prev = prevStateMap.get(win.id)
    if (prev) {
      prevStateMap.delete(win.id)
      if (prev.maximized) {
        win.maximize()
      } else {
        win.setBounds(prev.bounds)
      }
    }
    win.webContents.send('win:widgetMode', false)
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('app:getUpdaterState', () => getUpdaterState())

  ipcMain.handle('app:checkForUpdates', () => checkForUpdates())

  ipcMain.handle('app:installUpdate', () => installUpdate())

  ipcMain.handle('backup:export', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const date = new Date().toISOString().slice(0, 10)
    const result = await dialog.showSaveDialog(win!, {
      title: 'Export tasks',
      defaultPath: `donezone-backup-${date}.json`,
      filters: [{ name: 'DoneZone Backup', extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) return { success: false, canceled: true }
    try {
      const tasks = getAllTasks()
      const timers = getAllTimerTasks()
      const payload = {
        version: 2,
        exported_at: new Date().toISOString(),
        app: 'DoneZone',
        tasks: tasks.map(({ id: _id, ...t }) => t),
        timer_tasks: timers.map(({ id: _id, ...t }) => t),
      }
      fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf-8')
      return { success: true, path: result.filePath, count: tasks.length + timers.length }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('backup:import', async (event, replace: boolean) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      title: 'Import tasks',
      filters: [{ name: 'DoneZone Backup', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) return { imported: 0, canceled: true }
    try {
      const raw = fs.readFileSync(result.filePaths[0], 'utf-8')
      const parsed = JSON.parse(raw) as { tasks?: unknown[]; timer_tasks?: unknown[] }
      if (!parsed || !Array.isArray(parsed.tasks)) {
        return { imported: 0, error: 'Invalid backup file — missing tasks array.' }
      }
      const timers = Array.isArray(parsed.timer_tasks) ? parsed.timer_tasks : []
      const count = importBackup(
        parsed.tasks as Partial<import('../types/task').Task>[],
        timers as Partial<import('../types/timer').TimerTask>[],
        replace,
      )
      return { imported: count }
    } catch (err) {
      return { imported: 0, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
