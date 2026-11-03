// Shared types — imported by main process, preload, and renderer.
// This file must not import from 'electron', 'better-sqlite3', or any Node built-in.

export interface Task {
  id: number
  title: string
  description: string | null
  status: 'todo' | 'done'
  priority: 'low' | 'normal' | 'high'
  due_date: string | null
  tags: string[] | null
  source: string | null
  created_at: string
  completed_at: string | null
}

export type CreateTaskInput = {
  title: string
  description?: string | null
  status?: Task['status']
  priority?: Task['priority']
  due_date?: string | null
  tags?: string[] | null
  source?: string | null
}

export type UpdateTaskInput = Partial<{
  title: string
  description: string | null
  status: Task['status']
  priority: Task['priority']
  due_date: string | null
  tags: string[] | null
  source: string | null
  completed_at: string | null
}>

/** Shape of window.taskAPI exposed by the preload script. */
export interface TaskAPI {
  getAll: () => Promise<Task[]>
  create: (input: CreateTaskInput) => Promise<Task>
  update: (id: number, updates: UpdateTaskInput) => Promise<Task | undefined>
  delete: (id: number) => Promise<boolean>
  markDone: (id: number) => Promise<Task | undefined>
}
