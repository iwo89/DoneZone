export type AiProvider = 'gemini' | 'claude'

export interface FathomConfig {
  userName: string
  watchFolder: string
  aiProvider: AiProvider
  hasGeminiKey: boolean
  hasClaudeKey: boolean
}

export interface FathomConfigInput {
  userName?: string
  watchFolder?: string
  geminiApiKey?: string
  claudeApiKey?: string
  aiProvider?: AiProvider
}

export interface ProcessResult {
  processed: number
  created: number
  error?: string
}

export interface FathomAPI {
  getConfig: () => Promise<FathomConfig>
  setConfig: (input: FathomConfigInput) => Promise<void>
  resetConfig: () => Promise<void>
  browseFolder: () => Promise<string | null>
  processNow: () => Promise<ProcessResult>
  isWatcherActive: () => Promise<boolean>
  onTasksCreated: (callback: () => void) => void
}
