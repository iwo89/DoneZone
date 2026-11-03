import type { TaskAPI } from '../types/task'
import type { SettingsAPI } from '../types/settings'
import type { WindowAPI } from '../types/window'
import type { FathomAPI } from '../types/fathom'

declare global {
  interface Window {
    taskAPI: TaskAPI
    settingsAPI: SettingsAPI
    windowAPI: WindowAPI
    fathomAPI: FathomAPI
  }
}

export {}
