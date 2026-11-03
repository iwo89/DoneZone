import React, { useState, useEffect } from 'react'
import type { TimerTask } from '../../types/timer'
import { useFocusTrap } from '../useFocusTrap'
import { useT } from '../LanguageContext'

interface Props {
  task: TimerTask | null
  closing: boolean
  onSave: (data: { title: string; tag: string | null; comments: string | null }) => Promise<void>
  onClose: () => void
}

interface FormState {
  title: string
  tag: string
  comments: string
}

function toFormState(task: TimerTask | null): FormState {
  return {
    title: task?.title ?? '',
    tag: task?.tag ?? '',
    comments: task?.comments ?? '',
  }
}

export default function TimerTaskModal({ task, closing, onSave, onClose }: Props): React.JSX.Element {
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
        tag: form.tag.trim() || null,
        comments: form.comments.trim() || null,
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
        aria-label={task ? t.timer.edit : t.timer.modalAddTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{task ? t.timer.edit : t.timer.modalAddTitle}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t.taskModal.close}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">{t.timer.labelName}</span>
            <input
              className={`form-input${titleShaking ? ' form-input--shake' : ''}`}
              type="text"
              placeholder={t.timer.placeholderName}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">{t.timer.labelTag}</span>
            <input
              className="form-input"
              type="text"
              placeholder={t.timer.placeholderTag}
              value={form.tag}
              onChange={(e) => set('tag', e.target.value)}
              maxLength={50}
            />
          </label>

          <label className="form-field">
            <span className="form-label">{t.timer.labelComments}</span>
            <textarea
              className="form-input form-textarea"
              placeholder={t.timer.placeholderComments}
              value={form.comments}
              onChange={(e) => set('comments', e.target.value)}
              rows={3}
            />
          </label>

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
