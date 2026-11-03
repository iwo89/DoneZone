export interface WindowAPI {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
  enterWidget: () => Promise<void>
  exitWidget: () => Promise<void>
  onWidgetModeChange: (callback: (isWidget: boolean) => void) => () => void
  onOpenAddTask: (callback: () => void) => () => void
}
