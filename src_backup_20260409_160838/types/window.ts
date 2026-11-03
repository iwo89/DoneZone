// Shared window control types — no Node/Electron imports.

export interface WindowAPI {
  minimize: () => Promise<void>
  maximize: () => Promise<void>    // toggles maximize ↔ restore
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => void
}
