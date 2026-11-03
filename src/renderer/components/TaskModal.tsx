import React, { useState, useEffect } from 'react'
import type { Task, CreateTaskInput } from '../../types/task'
import TagInput from './TagInput'
import { useFocusTrap } from '../useFocusTrap'
import { useT } from '../LanguageContext'

interface Props {
  task: Task | null
  closing: boolean
  onSave: (data: CreateTaskInput) => Promise<void>
  onClose: () => void
}

interface FormState {
  title: string
  description: string
  priority: Task['priority']
  due_date: string
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

export default function TaskModal({ task, closing, onSave, onClose }: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(task))
  const [saving, setSaving] = useState(false)
  const [titleShaking, setTitleShaking] = useState(false)
  const trapRef = useFocusTrap<HTMLDivElement>()
  const t = useT()

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
    if (!form.title.trim()) {
      setTitleShaking(true)
      setTimeout(() => setTitleShaking(false), 420)
      return
    }
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
    <div className={`modal-overlay${closing ? ' modal-overlay--closing' : ''}`} onClick={onClose}>
      <div
        ref={trapRef}
        className={`modal${closing ? ' modal--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={task ? t.taskModal.ariaEdit : t.taskModal.ariaAdd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{task ? t.taskModal.titleEdit : t.taskModal.titleAdd}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t.taskModal.close}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">{t.taskModal.labelTitle}</span>
            <input
              className={`form-input${titleShaking ? ' form-input--shake' : ''}`}
              type="text"
              placeholder={t.taskModal.placeholderTitle}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">{t.taskModal.labelDescription}</span>
            <textarea
              className="form-input form-textarea"
              placeholder={t.taskModal.placeholderDescription}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </label>

          <label className="form-field">
            <span className="form-label">{t.taskModal.labelPriority}</span>
            <select
              className="form-input form-select"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as Task['priority'])}
            >
              <option value="low">{t.taskModal.low}</option>
              <option value="normal">{t.taskModal.normal}</option>
              <option value="high">{t.taskModal.high}</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">{t.taskModal.labelDueDate}</span>
            <input
              className="form-input"
              type="date"
              value={form.due_date}
              onChange={(e) => set('due_date', e.target.value)}
            />
          </label>

          <div className="form-field">
            <span className="form-label">{t.taskModal.labelTags}</span>
            <TagInput value={form.tags} onChange={(tags) => set('tags', tags)} />
            <span className="form-hint">{t.taskModal.hintTags}</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t.taskModal.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !form.title.trim()}
            >
              {saving ? t.taskModal.saving : task ? t.taskModal.saveChanges : t.taskModal.addTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
