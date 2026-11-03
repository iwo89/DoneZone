import { contextBridge, ipcRenderer } from 'electron'
import type { TaskAPI, CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { SettingsAPI } from '../types/settings'
import type { WindowAPI } from '../types/window'
import type { FathomAPI, FathomConfigInput } from '../types/fathom'

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
    ipcRenderer.on('win:maximized', (_event, isMaximized: boolean) => {
      callback(isMaximized)
    })
  },
}

const fathomAPI: FathomAPI = {
  getConfig: () =>
    ipcRenderer.invoke('fathom:getConfig'),

  setConfig: (input: FathomConfigInput) =>
    ipcRenderer.invoke('fathom:setConfig', input),

  resetConfig: () =>
    ipcRenderer.invoke('fathom:resetConfig'),

  browseFolder: () =>
    ipcRenderer.invoke('fathom:browseFolder'),

  processNow: () =>
    ipcRenderer.invoke('fathom:processNow'),

  isWatcherActive: () =>
    ipcRenderer.invoke('fathom:isWatcherActive'),

  onTasksCreated: (callback: () => void) => {
    ipcRenderer.on('fathom:tasksCreated', () => callback())
  },
}

contextBridge.exposeInMainWorld('taskAPI', taskAPI)
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
contextBridge.exposeInMainWorld('windowAPI', windowAPI)
contextBridge.exposeInMainWorld('fathomAPI', fathomAPI)
