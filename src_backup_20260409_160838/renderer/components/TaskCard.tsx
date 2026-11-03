import React from 'react'
import type { Task } from '../../types/task'

interface Props {
  task: Task
  onEdit: () => void
  onMarkDone: () => void
  onDelete: () => void
  showMarkDone: boolean
}

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

export default function TaskCard({
  task,
  onEdit,
  onMarkDone,
  onDelete,
  showMarkDone,
}: Props): React.JSX.Element {
  return (
    <div className="task-card" onClick={onEdit} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
    >
      <div className="task-card-body">
        <span className="task-title">{task.title}</span>
        {task.description && (
          <span className="task-description">{task.description}</span>
        )}
        <div className="task-meta">
          <span className={`priority-badge priority-badge--${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.due_date && (
            <span className="due-date">Due {formatDate(task.due_date)}</span>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="tag-chips">
              {task.tags.map((tag) => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
        {showMarkDone && (
          <button className="btn btn-success btn-icon" onClick={onMarkDone} aria-label="Mark as done" title="Mark as done">
            <CheckIcon />
          </button>
        )}
        <button className="btn btn-danger btn-icon" onClick={onDelete} aria-label="Delete task" title="Delete task">
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
