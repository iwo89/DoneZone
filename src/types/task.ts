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
  sort_order: number
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

export interface TaskAPI {
  getAll: () => Promise<Task[]>
  create: (input: CreateTaskInput) => Promise<Task>
  update: (id: number, updates: UpdateTaskInput) => Promise<Task | undefined>
  delete: (id: number) => Promise<boolean>
  markDone: (id: number) => Promise<Task | undefined>
  reorder: (ids: number[]) => Promise<void>
}
