export interface TimerTask {
  id: number
  title: string
  tag: string | null
  comments: string | null
  accumulated_seconds: number
  started_at: string | null
  linked_task_id: number | null
  status: 'todo' | 'done'
  completed_at: string | null
  created_at: string
}

export type CreateTimerTaskInput = {
  title: string
  tag?: string | null
  comments?: string | null
  linked_task_id?: number | null
}

export type UpdateTimerTaskInput = Partial<{
  title: string
  tag: string | null
  comments: string | null
}>

export interface TimerAPI {
  getAll: () => Promise<TimerTask[]>
  create: (input: CreateTimerTaskInput) => Promise<TimerTask>
  update: (id: number, updates: UpdateTimerTaskInput) => Promise<TimerTask | undefined>
  delete: (id: number) => Promise<boolean>
  start: (id: number) => Promise<TimerTask | undefined>
  stop: (id: number) => Promise<TimerTask | undefined>
  markDone: (id: number) => Promise<TimerTask | undefined>
  discardRun: (id: number) => Promise<TimerTask | undefined>
}
