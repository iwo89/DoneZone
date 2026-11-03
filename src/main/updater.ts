import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow } from 'electron'
import type { UpdateState } from '../types/updater'

let state: UpdateState = { status: 'idle' }
let availableVersion: string | null = null

function broadcast(newState: UpdateState): void {
  state = newState
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('updater:status', state)
  })
}

export function setupAutoUpdater(): void {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    broadcast({ status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    availableVersion = String(info.version)
    broadcast({ status: 'available', detail: availableVersion })
  })

  autoUpdater.on('update-not-available', () => {
    broadcast({ status: 'not-available' })
  })

  autoUpdater.on('download-progress', () => {
    broadcast({ status: 'downloading' })
  })

  autoUpdater.on('update-downloaded', () => {
    broadcast({ status: 'ready', detail: availableVersion ?? undefined })
  })

  autoUpdater.on('error', (err) => {
    broadcast({ status: 'error', detail: err.message })
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: unknown) => {
      console.warn('[Updater] Auto-check failed:', err instanceof Error ? err.message : err)
    })
  }, 5_000)
}

export function checkForUpdates(): void {
  if (!app.isPackaged) {
    broadcast({ status: 'error', detail: 'dev-mode' })
    return
  }
  broadcast({ status: 'checking' })
  autoUpdater.checkForUpdates().catch((err: unknown) => {
    broadcast({ status: 'error', detail: err instanceof Error ? err.message : String(err) })
  })
}

export function installUpdate(): void {
  if (!app.isPackaged) return
  autoUpdater.quitAndInstall(true, true)
}

export function getUpdaterState(): UpdateState {
  return state
}
