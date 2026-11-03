import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

export type { Task, CreateTaskInput, UpdateTaskInput }

interface TaskRow {
  id: number
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  tags: string | null
  source: string | null
  created_at: string
  completed_at: string | null
}

const dbPath = path.join(app.getPath('userData'), 'donezone.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    description  TEXT,
    status       TEXT    NOT NULL DEFAULT 'todo',
    priority     TEXT    NOT NULL DEFAULT 'normal',
    due_date     TEXT,
    tags         TEXT,
    source       TEXT,
    created_at   TEXT    NOT NULL DEFAULT current_timestamp,
    completed_at TEXT
  )
`)

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN description TEXT`)
} catch {
  // Column already exists — safe to ignore
}

function rowToTask(row: TaskRow): Task {
  return {
    ...row,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    tags: row.tags !== null ? (JSON.parse(row.tags) as string[]) : null,
  }
}

function getById(id: number): Task | undefined {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined
  return row ? rowToTask(row) : undefined
}

export function getAllTasks(): Task[] {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as TaskRow[]
  return rows.map(rowToTask)
}

export function createTask(input: CreateTaskInput): Task {
  const result = db
    .prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, tags, source)
      VALUES (@title, @description, @status, @priority, @due_date, @tags, @source)
    `)
    .run({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'normal',
      due_date: input.due_date ?? null,
      tags: input.tags !== undefined && input.tags !== null ? JSON.stringify(input.tags) : null,
      source: input.source ?? null,
    })

  return getById(result.lastInsertRowid as number)!
}

export function updateTask(id: number, updates: UpdateTaskInput): Task | undefined {
  const raw: Record<string, unknown> = { ...updates }
  if ('tags' in updates) {
    raw.tags = updates.tags !== null && updates.tags !== undefined
      ? JSON.stringify(updates.tags)
      : null
  }

  const fields = Object.keys(raw)
  if (fields.length === 0) return getById(id)

  const setClause = fields.map((f) => `${f} = @${f}`).join(', ')
  db.prepare(`UPDATE tasks SET ${setClause} WHERE id = @id`).run({ ...raw, id })

  return getById(id)
}

export function deleteTask(id: number): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return result.changes > 0
}

export function taskExistsByTitle(title: string): boolean {
  const row = db.prepare('SELECT id FROM tasks WHERE lower(title) = lower(?)').get(title)
  return row !== undefined
}

export function markAsDone(id: number): Task | undefined {
  const task = getById(id)
  if (!task) return undefined

  return updateTask(id, {
    status: 'done',
    completed_at: task.completed_at ?? new Date().toISOString(),
  })
}

export default db
