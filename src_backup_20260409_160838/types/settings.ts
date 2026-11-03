// Shared settings types — no Node/Electron imports.

export interface SettingsAPI {
  getOpenAtLogin: () => Promise<boolean>
  setOpenAtLogin: (enabled: boolean) => Promise<void>
  getNotificationsEnabled: () => Promise<boolean>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
}
