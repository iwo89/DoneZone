export interface BackupExportResult {
  success: boolean
  canceled?: boolean
  path?: string
  count?: number
  error?: string
}

export interface BackupImportResult {
  imported: number
  canceled?: boolean
  error?: string
}

export interface BackupAPI {
  exportTasks: () => Promise<BackupExportResult>
  importTasks: (replace: boolean) => Promise<BackupImportResult>
}
