import type { TaskAPI } from '../types/task'
import type { SettingsAPI } from '../types/settings'
import type { WindowAPI } from '../types/window'
import type { UpdaterAPI } from '../types/updater'
import type { BackupAPI } from '../types/backup'
import type { TimerAPI } from '../types/timer'

declare global {
  interface Window {
    taskAPI: TaskAPI
    settingsAPI: SettingsAPI
    windowAPI: WindowAPI
    updaterAPI: UpdaterAPI
    backupAPI: BackupAPI
    timerAPI: TimerAPI
  }
}

export {}
