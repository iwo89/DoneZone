import React, { useState, useEffect } from 'react'
import type { Task, CreateTaskInput } from '../../types/task'
import TagInput from './TagInput'

interface Props {
  task: Task | null          // null → add mode, Task → edit mode
  onSave: (data: CreateTaskInput) => Promise<void>
  onClose: () => void
}

interface FormState {
  title: string
  description: string
  priority: Task['priority']
  due_date: string           // YYYY-MM-DD or ''
  tags: string[]
}

function toFormState(task: Task | null): FormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'normal',
    due_date: task?.due_date ? task.due_date.slice(0, 10) : '',
    tags: task?.tags ?? [],
  }
}

export default function TaskModal({ task, onSave, onClose }: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(task))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(toFormState(task))
  }, [task])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
        tags: form.tags.length > 0 ? form.tags : null,
      })
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof FormState>(key: K, val: FormState[K]): void {
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={task ? 'Edit task' : 'New task'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Title</span>
            <input
              className="form-input"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Description</span>
            <textarea
              className="form-input form-textarea"
              placeholder="Optional notes or details…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </label>

          <label className="form-field">
            <span className="form-label">Priority</span>
            <select
              className="form-input form-select"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as Task['priority'])}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Due date</span>
            <input
              className="form-input"
              type="date"
              value={form.due_date}
              onChange={(e) => set('due_date', e.target.value)}
            />
          </label>

          <div className="form-field">
            <span className="form-label">Tags</span>
            <TagInput value={form.tags} onChange={(tags) => set('tags', tags)} />
            <span className="form-hint">Press Enter or comma to add a tag</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !form.title.trim()}
            >
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
