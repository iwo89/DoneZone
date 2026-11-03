import { contextBridge, ipcRenderer } from 'electron'
import type { TaskAPI, CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { SettingsAPI } from '../types/settings'
import type { WindowAPI } from '../types/window'
import type { UpdaterAPI, UpdateState } from '../types/updater'
import type { BackupAPI } from '../types/backup'
import type { TimerAPI, CreateTimerTaskInput, UpdateTimerTaskInput } from '../types/timer'

const taskAPI: TaskAPI = {
  getAll: () =>
    ipcRenderer.invoke('tasks:getAll'),

  create: (input: CreateTaskInput) =>
    ipcRenderer.invoke('tasks:create', input),

  update: (id: number, updates: UpdateTaskInput) =>
    ipcRenderer.invoke('tasks:update', id, updates),

  delete: (id: number) =>
    ipcRenderer.invoke('tasks:delete', id),

  markDone: (id: number) =>
    ipcRenderer.invoke('tasks:markDone', id),

  reorder: (ids: number[]) =>
    ipcRenderer.invoke('tasks:reorder', ids),
}

const settingsAPI: SettingsAPI = {
  getOpenAtLogin: () =>
    ipcRenderer.invoke('settings:getOpenAtLogin'),

  setOpenAtLogin: (enabled: boolean) =>
    ipcRenderer.invoke('settings:setOpenAtLogin', enabled),

  getNotificationsEnabled: () =>
    ipcRenderer.invoke('settings:getNotificationsEnabled'),

  setNotificationsEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('settings:setNotificationsEnabled', enabled),

  getCloseToTray: () =>
    ipcRenderer.invoke('settings:getCloseToTray'),

  setCloseToTray: (enabled: boolean) =>
    ipcRenderer.invoke('settings:setCloseToTray', enabled),

  getStartMinimized: () =>
    ipcRenderer.invoke('settings:getStartMinimized'),

  setStartMinimized: (enabled: boolean) =>
    ipcRenderer.invoke('settings:setStartMinimized', enabled),

  getWidgetAlwaysOnTop: () =>
    ipcRenderer.invoke('settings:getWidgetAlwaysOnTop'),

  setWidgetAlwaysOnTop: (enabled: boolean) =>
    ipcRenderer.invoke('settings:setWidgetAlwaysOnTop', enabled),
}

const windowAPI: WindowAPI = {
  minimize: () =>
    ipcRenderer.invoke('win:minimize'),

  maximize: () =>
    ipcRenderer.invoke('win:maximize'),

  close: () =>
    ipcRenderer.invoke('win:close'),

  isMaximized: () =>
    ipcRenderer.invoke('win:isMaximized'),

  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => callback(isMaximized)
    ipcRenderer.on('win:maximized', listener)
    return () => ipcRenderer.off('win:maximized', listener)
  },

  enterWidget: () =>
    ipcRenderer.invoke('win:enterWidget'),

  exitWidget: () =>
    ipcRenderer.invoke('win:exitWidget'),

  onWidgetModeChange: (callback: (isWidget: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, isWidget: boolean): void => callback(isWidget)
    ipcRenderer.on('win:widgetMode', listener)
    return () => ipcRenderer.off('win:widgetMode', listener)
  },

  onOpenAddTask: (callback: () => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('win:openAddTask', listener)
    return () => ipcRenderer.off('win:openAddTask', listener)
  },
}

const updaterAPI: UpdaterAPI = {
  getAppVersion: () =>
    ipcRenderer.invoke('app:getVersion'),

  getState: () =>
    ipcRenderer.invoke('app:getUpdaterState'),

  checkForUpdates: () =>
    ipcRenderer.invoke('app:checkForUpdates'),

  installUpdate: () =>
    ipcRenderer.invoke('app:installUpdate'),

  onStatusChange: (callback: (state: UpdateState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, newState: UpdateState): void => callback(newState)
    ipcRenderer.on('updater:status', listener)
    return () => ipcRenderer.off('updater:status', listener)
  },
}

const backupAPI: BackupAPI = {
  exportTasks: () =>
    ipcRenderer.invoke('backup:export'),

  importTasks: (replace: boolean) =>
    ipcRenderer.invoke('backup:import', replace),
}

const timerAPI: TimerAPI = {
  getAll: () =>
    ipcRenderer.invoke('timer:getAll'),

  create: (input: CreateTimerTaskInput) =>
    ipcRenderer.invoke('timer:create', input),

  update: (id: number, updates: UpdateTimerTaskInput) =>
    ipcRenderer.invoke('timer:update', id, updates),

  delete: (id: number) =>
    ipcRenderer.invoke('timer:delete', id),

  start: (id: number) =>
    ipcRenderer.invoke('timer:start', id),

  stop: (id: number) =>
    ipcRenderer.invoke('timer:stop', id),

  markDone: (id: number) =>
    ipcRenderer.invoke('timer:markDone', id),

  discardRun: (id: number) =>
    ipcRenderer.invoke('timer:discardRun', id),
}

contextBridge.exposeInMainWorld('taskAPI', taskAPI)
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
contextBridge.exposeInMainWorld('windowAPI', windowAPI)
contextBridge.exposeInMainWorld('updaterAPI', updaterAPI)
contextBridge.exposeInMainWorld('backupAPI', backupAPI)
contextBridge.exposeInMainWorld('timerAPI', timerAPI)
