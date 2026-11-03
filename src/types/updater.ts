export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'

export interface UpdateState {
  status: UpdateStatus
  detail?: string
}

export interface UpdaterAPI {
  getAppVersion: () => Promise<string>
  getState: () => Promise<UpdateState>
  checkForUpdates: () => Promise<void>
  installUpdate: () => Promise<void>
  onStatusChange: (callback: (state: UpdateState) => void) => () => void
}
