import { Notification } from 'electron'
import { getAllTasks } from '../db/database'
import store from './store'

function send(title: string, body: string): void {
  if (!Notification.isSupported()) return
  if (!store.get('notificationsEnabled')) return
  new Notification({ title, body }).show()
}

function localDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const notified = new Set<string>()
let lastPruneDate = ''

export function notifyTaskCreated(taskTitle: string): void {
  send('New Task Added', taskTitle)
}

export function checkDueSoon(): void {
  const now = new Date()
  const todayStr = localDateStr(now)

  if (lastPruneDate !== todayStr) {
    for (const key of notified) {
      if (!key.endsWith(todayStr)) notified.delete(key)
    }
    lastPruneDate = todayStr
  }

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = localDateStr(tomorrow)

  for (const task of getAllTasks()) {
    if (task.status !== 'todo' || !task.due_date) continue
    const due = task.due_date.slice(0, 10)
    if (due !== todayStr && due !== tomorrowStr) continue
    const key = `${task.id}-${todayStr}`
    if (notified.has(key)) continue
    notified.add(key)
    send('Task Due Soon', `${task.title} is due on ${formatDisplayDate(due)}`)
  }
}

export function startDueReminders(): void {
  checkDueSoon()
  const interval = setInterval(checkDueSoon, 60 * 60 * 1000)
  interval.unref()
}
