import Store from 'electron-store'
import type { AiProvider } from '../types/fathom'

interface StoreSchema {
  userName: string
  geminiApiKey: string
  claudeApiKey: string
  aiProvider: AiProvider
  watchFolder: string
  notificationsEnabled: boolean
}

const store = new Store<StoreSchema>({
  name: 'donezone-config',
  defaults: {
    userName: '',
    geminiApiKey: '',
    claudeApiKey: '',
    aiProvider: 'gemini',
    watchFolder: '',
    notificationsEnabled: true,
  },
})

export default store
