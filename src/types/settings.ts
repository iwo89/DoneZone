export interface SettingsAPI {
  getOpenAtLogin: () => Promise<boolean>
  setOpenAtLogin: (enabled: boolean) => Promise<void>
  getNotificationsEnabled: () => Promise<boolean>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
  getCloseToTray: () => Promise<boolean>
  setCloseToTray: (enabled: boolean) => Promise<void>
  getStartMinimized: () => Promise<boolean>
  setStartMinimized: (enabled: boolean) => Promise<void>
  getWidgetAlwaysOnTop: () => Promise<boolean>
  setWidgetAlwaysOnTop: (enabled: boolean) => Promise<void>
}
