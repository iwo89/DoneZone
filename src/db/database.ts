import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { TimerTask, CreateTimerTaskInput, UpdateTimerTaskInput } from '../types/timer'

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
  sort_order: number
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
    completed_at TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0
  )
`)

for (const migration of [
  `ALTER TABLE tasks ADD COLUMN description TEXT`,
  `ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`,
]) {
  try { db.exec(migration) } catch { }
}

db.exec(`
  UPDATE tasks SET sort_order = id WHERE sort_order = 0
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_status        ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date      ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_sort_order    ON tasks(sort_order);
  CREATE INDEX IF NOT EXISTS idx_tasks_status_due    ON tasks(status, due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS timer_tasks (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL,
    tag                 TEXT,
    comments            TEXT,
    accumulated_seconds INTEGER NOT NULL DEFAULT 0,
    started_at          TEXT,
    linked_task_id      INTEGER,
    status              TEXT    NOT NULL DEFAULT 'todo',
    completed_at        TEXT,
    created_at          TEXT    NOT NULL DEFAULT current_timestamp
  );
  CREATE INDEX IF NOT EXISTS idx_timer_tasks_linked ON timer_tasks(linked_task_id);
`)

for (const migration of [
  `ALTER TABLE timer_tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'todo'`,
  `ALTER TABLE timer_tasks ADD COLUMN completed_at TEXT`,
]) {
  try { db.exec(migration) } catch { }
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
  const rows = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, created_at ASC').all() as TaskRow[]
  return rows.map(rowToTask)
}

const getMaxSortOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM tasks')
const insertTask = db.prepare(`
  INSERT INTO tasks (title, description, status, priority, due_date, tags, source, sort_order)
  VALUES (@title, @description, @status, @priority, @due_date, @tags, @source, @sort_order)
`)

export function createTask(input: CreateTaskInput): Task {
  const rowid = db.transaction((): number => {
    const { m } = getMaxSortOrder.get() as { m: number }
    return insertTask.run({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'normal',
      due_date: input.due_date ?? null,
      tags: input.tags !== undefined && input.tags !== null ? JSON.stringify(input.tags) : null,
      source: input.source ?? null,
      sort_order: m + 1,
    }).lastInsertRowid as number
  })()
  return getById(rowid)!
}

const UPDATABLE_FIELDS = new Set([
  'title', 'description', 'status', 'priority',
  'due_date', 'tags', 'source', 'completed_at', 'sort_order',
])

export function updateTask(id: number, updates: UpdateTaskInput): Task | undefined {
  const raw: Record<string, unknown> = { ...updates }
  if ('tags' in updates) {
    raw.tags = updates.tags !== null && updates.tags !== undefined
      ? JSON.stringify(updates.tags)
      : null
  }

  const fields = Object.keys(raw).filter((f) => UPDATABLE_FIELDS.has(f))
  if (fields.length === 0) return getById(id)

  const setClause = fields.map((f) => `${f} = @${f}`).join(', ')
  db.prepare(`UPDATE tasks SET ${setClause} WHERE id = @id`).run({ ...raw, id })

  return getById(id)
}

export function deleteTask(id: number): boolean {
  return db.transaction((): boolean => {
    db.prepare('UPDATE timer_tasks SET linked_task_id = NULL WHERE linked_task_id = ?').run(id)
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0
  })()
}

export function markAsDone(id: number): Task | undefined {
  const task = getById(id)
  if (!task) return undefined

  return updateTask(id, {
    status: 'done',
    completed_at: task.completed_at ?? new Date().toISOString(),
  })
}

export function reorderTasks(ids: number[]): void {
  const update = db.prepare('UPDATE tasks SET sort_order = ? WHERE id = ?')
  db.transaction(() => {
    ids.forEach((id, idx) => update.run(idx + 1, id))
  })()
}

function asText(value: unknown, cap: number): string | null {
  if (typeof value !== 'string' || value.length === 0) return null
  return value.slice(0, cap)
}

export function importBackup(tasks: Partial<Task>[], timers: Partial<TimerTask>[], replace: boolean): number {
  let count = 0
  const insertTaskRow = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, tags, source, created_at, completed_at, sort_order)
    VALUES (@title, @description, @status, @priority, @due_date, @tags, @source, @created_at, @completed_at, @sort_order)
  `)
  const insertTimerRow = db.prepare(`
    INSERT INTO timer_tasks (title, tag, comments, accumulated_seconds, started_at, linked_task_id, status, completed_at, created_at)
    VALUES (@title, @tag, @comments, @accumulated_seconds, NULL, NULL, @status, @completed_at, @created_at)
  `)
  db.transaction(() => {
    if (replace) {
      db.exec('DELETE FROM tasks')
      db.exec('DELETE FROM timer_tasks')
    }
    const { m } = getMaxSortOrder.get() as { m: number }
    let nextOrder = m + 1
    for (const t of tasks) {
      if (!t.title || typeof t.title !== 'string') continue
      insertTaskRow.run({
        title: t.title.slice(0, 500),
        description: asText(t.description, 5000),
        status: t.status === 'done' ? 'done' : 'todo',
        priority: ['low', 'normal', 'high'].includes(t.priority ?? '') ? t.priority : 'normal',
        due_date: asText(t.due_date, 30),
        tags: Array.isArray(t.tags) ? JSON.stringify(t.tags.slice(0, 20).map((x) => String(x).slice(0, 50))) : null,
        source: asText(t.source, 100),
        created_at: asText(t.created_at, 40) ?? new Date().toISOString(),
        completed_at: asText(t.completed_at, 40),
        sort_order: nextOrder++,
      })
      count++
    }
    for (const tt of timers) {
      if (!tt.title || typeof tt.title !== 'string') continue
      const seconds = typeof tt.accumulated_seconds === 'number' && Number.isFinite(tt.accumulated_seconds)
        ? Math.max(0, Math.floor(tt.accumulated_seconds))
        : 0
      insertTimerRow.run({
        title: tt.title.slice(0, 500),
        tag: asText(tt.tag, 50),
        comments: asText(tt.comments, 5000),
        accumulated_seconds: seconds,
        status: tt.status === 'done' ? 'done' : 'todo',
        completed_at: asText(tt.completed_at, 40),
        created_at: asText(tt.created_at, 40) ?? new Date().toISOString(),
      })
      count++
    }
  })()
  return count
}

function getTimerById(id: number): TimerTask | undefined {
  return db.prepare('SELECT * FROM timer_tasks WHERE id = ?').get(id) as TimerTask | undefined
}

export function getAllTimerTasks(): TimerTask[] {
  return db.prepare('SELECT * FROM timer_tasks ORDER BY created_at DESC, id DESC').all() as TimerTask[]
}

export function createTimerTask(input: CreateTimerTaskInput): TimerTask {
  const result = db
    .prepare('INSERT INTO timer_tasks (title, tag, comments, linked_task_id) VALUES (@title, @tag, @comments, @linked_task_id)')
    .run({
      title: input.title,
      tag: input.tag ?? null,
      comments: input.comments ?? null,
      linked_task_id: input.linked_task_id ?? null,
    })
  return getTimerById(result.lastInsertRowid as number)!
}

const UPDATABLE_TIMER_FIELDS = new Set(['title', 'tag', 'comments'])

export function updateTimerTask(id: number, updates: UpdateTimerTaskInput): TimerTask | undefined {
  const raw: Record<string, unknown> = { ...updates }
  const fields = Object.keys(raw).filter((f) => UPDATABLE_TIMER_FIELDS.has(f))
  if (fields.length === 0) return getTimerById(id)
  const setClause = fields.map((f) => `${f} = @${f}`).join(', ')
  db.prepare(`UPDATE timer_tasks SET ${setClause} WHERE id = @id`).run({ ...raw, id })
  return getTimerById(id)
}

export function deleteTimerTask(id: number): boolean {
  return db.prepare('DELETE FROM timer_tasks WHERE id = ?').run(id).changes > 0
}

export function startTimer(id: number): TimerTask | undefined {
  db.prepare(`UPDATE timer_tasks SET started_at = ? WHERE id = ? AND started_at IS NULL AND status != 'done'`)
    .run(new Date().toISOString(), id)
  return getTimerById(id)
}

export function stopTimer(id: number): TimerTask | undefined {
  const task = getTimerById(id)
  if (!task) return undefined
  if (task.started_at !== null) {
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(task.started_at).getTime()) / 1000))
    db.prepare('UPDATE timer_tasks SET accumulated_seconds = accumulated_seconds + ?, started_at = NULL WHERE id = ?')
      .run(elapsed, id)
  }
  return getTimerById(id)
}

export function discardTimerRun(id: number): TimerTask | undefined {
  db.prepare('UPDATE timer_tasks SET started_at = NULL WHERE id = ?').run(id)
  return getTimerById(id)
}

export function markTimerDone(id: number): TimerTask | undefined {
  const task = stopTimer(id)
  if (!task) return undefined
  db.prepare('UPDATE timer_tasks SET status = ?, completed_at = COALESCE(completed_at, ?) WHERE id = ?')
    .run('done', new Date().toISOString(), id)
  return getTimerById(id)
}

export default db
