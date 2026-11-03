import Store from 'electron-store'

interface StoreSchema {
  notificationsEnabled: boolean
  closeToTray: boolean
  startMinimized: boolean
  widgetAlwaysOnTop: boolean
}

const store = new Store<StoreSchema>({
  name: 'donezone-config',
  defaults: {
    notificationsEnabled: true,
    closeToTray: false,
    startMinimized: false,
    widgetAlwaysOnTop: true,
  },
})

export default store
