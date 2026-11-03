import React, { useEffect } from 'react'
import type { TimerTask } from '../../types/timer'
import TimerText from './TimerText'
import { useFocusTrap } from '../useFocusTrap'
import { useT } from '../LanguageContext'

interface Props {
  task: TimerTask
  closing: boolean
  onClose: () => void
  onEdit: () => void
  onStart: (id: number) => void
  onStop: (id: number) => void
}

function formatCreated(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TimerDetailModal({ task, closing, onClose, onEdit, onStart, onStop }: Props): React.JSX.Element {
  const t = useT()
  const trapRef = useFocusTrap<HTMLDivElement>()
  const running = task.started_at !== null

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={`modal-overlay${closing ? ' modal-overlay--closing' : ''}`} onClick={onClose}>
      <div
        ref={trapRef}
        className={`modal timer-detail-modal${closing ? ' modal--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.timer.detailTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{t.timer.detailTitle}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t.taskModal.close}>×</button>
        </div>

        <div className="timer-detail-body">
          <div className={`timer-display${running ? ' timer-display--running' : ''}`}>
            <TimerText accumulated={task.accumulated_seconds} startedAt={task.started_at} className="timer-display-time" />
            {running && <span className="timer-display-status">{t.timer.running}</span>}
          </div>

          {task.status !== 'done' && (
            <div className="timer-detail-controls">
              {running ? (
                <button className="btn btn-danger timer-btn" onClick={() => onStop(task.id)}>
                  {t.timer.stop}
                </button>
              ) : (
                <button className="btn btn-success timer-btn" onClick={() => onStart(task.id)}>
                  {t.timer.start}
                </button>
              )}
            </div>
          )}

          <div className="timer-detail-info">
            <h3 className="timer-detail-name">{task.title}</h3>

            <div className="timer-detail-meta">
              {task.tag && <span className="tag-chip">{task.tag}</span>}
              <span className="timer-detail-created">{t.timer.created} {formatCreated(task.created_at)}</span>
              {task.linked_task_id !== null && (
                <span className="timer-linked-badge">{t.timer.fromTodo}</span>
              )}
            </div>

            {task.comments && (
              <p className="timer-detail-comments">{task.comments}</p>
            )}
          </div>
        </div>

        <div className="modal-footer timer-detail-footer">
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            {t.timer.edit}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t.taskModal.close}
          </button>
        </div>
      </div>
    </div>
  )
}
