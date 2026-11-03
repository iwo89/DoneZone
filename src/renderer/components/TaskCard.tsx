import React, { useState, useEffect, useRef } from 'react'
import type { Task } from '../../types/task'
import type { TimerTask } from '../../types/timer'
import TimerText from './TimerText'
import { useT } from '../LanguageContext'

interface Props {
  task: Task
  onEdit: (id: number) => void
  onMarkDone: (id: number) => void
  onDelete: (id: number) => void
  showMarkDone: boolean
  completing?: boolean
  draggable?: boolean
  linkedTimer?: TimerTask | null
  onTrackTime?: (id: number) => void
  onOpenTimer?: (timerId: number) => void
}

function getDueStatus(due_date: string | null): 'overdue' | 'due-today' | null {
  if (!due_date) return null
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (due_date < todayStr) return 'overdue'
  if (due_date === todayStr) return 'due-today'
  return null
}

function DragHandleIcon(): React.JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className="drag-handle-icon">
      <rect x="2" y="2" width="10" height="1.8" rx="0.9" />
      <rect x="2" y="6.1" width="10" height="1.8" rx="0.9" />
      <rect x="2" y="10.2" width="10" height="1.8" rx="0.9" />
    </svg>
  )
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ClockIcon(): React.JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" />
      <polyline points="7,4 7,7 9.5,8.5" />
    </svg>
  )
}

function AddTimerIcon(): React.JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="6" cy="7.5" r="4.8" />
      <line x1="6" y1="5.2" x2="6" y2="7.5" />
      <line x1="4.5" y1="1.2" x2="7.5" y2="1.2" />
      <line x1="11.5" y1="8.5" x2="11.5" y2="13" />
      <line x1="9.25" y1="10.75" x2="13.75" y2="10.75" />
    </svg>
  )
}

function CheckIcon(): React.JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="2.5,8 6,11.5 12.5,3.5" />
    </svg>
  )
}

function TrashIcon(): React.JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="1,3.5 13,3.5" />
      <path d="M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1" />
      <path d="M2.5 3.5l.8 8a.5.5 0 0 0 .5.5h6.4a.5.5 0 0 0 .5-.5l.8-8" />
      <line x1="5.5" y1="6.5" x2="5.5" y2="9.5" />
      <line x1="8.5" y1="6.5" x2="8.5" y2="9.5" />
    </svg>
  )
}

const CONFIRM_TIMEOUT = 5000

const TaskCard = React.memo(function TaskCard({
  task,
  onEdit,
  onMarkDone,
  onDelete,
  showMarkDone,
  completing = false,
  draggable = false,
  linkedTimer = null,
  onTrackTime,
  onOpenTimer,
}: Props): React.JSX.Element {
  const t = useT()
  const [confirming, setConfirming] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!confirming) return
    confirmTimer.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT)
    return () => {
      if (confirmTimer.current !== null) clearTimeout(confirmTimer.current)
    }
  }, [confirming])

  const priorityLabels = { low: t.taskCard.low, normal: t.taskCard.normal, high: t.taskCard.high }
  const dueStatus = task.status === 'todo' ? getDueStatus(task.due_date) : null

  const classes = [
    'task-card',
    completing ? 'task-card--completing' : '',
    dueStatus === 'overdue' ? 'task-card--overdue' : '',
    dueStatus === 'due-today' ? 'task-card--due-today' : '',
    draggable ? 'task-card--draggable' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onClick={completing ? undefined : () => onEdit(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => !completing && e.key === 'Enter' && onEdit(task.id)}
    >
      {draggable && (
        <div
          className="drag-handle"
          onClick={(e) => e.stopPropagation()}
          aria-label={t.taskCard.dragHandle}
          role="img"
        >
          <DragHandleIcon />
        </div>
      )}

      <div className="task-card-body">
        <span className="task-title">{task.title}</span>
        {task.description && (
          <span className="task-description">{task.description}</span>
        )}
        <div className="task-meta">
          <span className={`priority-badge priority-badge--${task.priority}`}>
            {priorityLabels[task.priority]}
          </span>
          {task.due_date && (
            <span className={`due-date${dueStatus ? ` due-date--${dueStatus}` : ''}`}>
              {t.taskCard.due} {formatDate(task.due_date)}
            </span>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="tag-chips">
              {task.tags.map((tag) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}
          {linkedTimer && onOpenTimer && (
            <button
              className={`timer-chip${linkedTimer.started_at !== null ? ' timer-chip--running' : ''}`}
              onClick={(e) => { e.stopPropagation(); onOpenTimer(linkedTimer.id) }}
              title={t.timer.jumpToTracker}
              aria-label={t.timer.jumpToTracker}
            >
              <ClockIcon />
              <TimerText accumulated={linkedTimer.accumulated_seconds} startedAt={linkedTimer.started_at} />
            </button>
          )}
        </div>
      </div>

      <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
        {confirming ? (
          <div className="task-card-confirm">
            <span className="task-card-confirm-label">{t.taskCard.deleteConfirm}</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(task.id)}
              aria-label={t.taskCard.deleteYes}
            >
              {t.taskCard.deleteYes}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(false)}
              aria-label={t.taskCard.deleteNo}
            >
              {t.taskCard.deleteNo}
            </button>
          </div>
        ) : (
          <>
            {showMarkDone && !linkedTimer && onTrackTime && (
              <button className="btn btn-ghost btn-icon" onClick={() => onTrackTime(task.id)}
                aria-label={t.timer.trackTime} title={t.timer.trackTime}>
                <AddTimerIcon />
              </button>
            )}
            {showMarkDone && (
              <button className="btn btn-success btn-icon" onClick={() => onMarkDone(task.id)}
                aria-label={t.taskCard.markDone} title={t.taskCard.markDone}>
                <CheckIcon />
              </button>
            )}
            <button
              className="btn btn-danger btn-icon"
              onClick={() => setConfirming(true)}
              aria-label={t.taskCard.deleteTask}
              title={t.taskCard.deleteTask}
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </div>
  )
})

export default TaskCard
