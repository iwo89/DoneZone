import React, { useState, useEffect, useRef } from 'react'
import type { TimerTask } from '../../types/timer'
import TimerText from './TimerText'
import { formatHMS, elapsedSeconds } from '../timeUtils'
import { useT } from '../LanguageContext'
import SearchBar from './SearchBar'
import { matchesSearch, type SearchState } from '../searchUtils'

interface Props {
  tasks: TimerTask[]
  onAdd: () => void
  onOpen: (id: number) => void
  onDelete: (id: number) => void
  onMarkDone: (id: number) => void
  onStart: (id: number) => void
  onStop: (id: number) => void
  search?: SearchState
}

function PlayIcon(): React.JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5 L11 6.5 L3 11.5 Z" />
    </svg>
  )
}

function StopIcon(): React.JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function TimerTotals({ tasks }: { tasks: TimerTask[] }): React.JSX.Element | null {
  const t = useT()
  const anyRunning = tasks.some((x) => x.started_at !== null)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!anyRunning) return
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [anyRunning])

  if (tasks.length === 0) return null

  let total = 0
  const byTag = new Map<string, number>()
  for (const x of tasks) {
    const s = elapsedSeconds(x.accumulated_seconds, x.started_at)
    total += s
    if (x.tag) byTag.set(x.tag, (byTag.get(x.tag) ?? 0) + s)
  }
  const tags = Array.from(byTag.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="timer-totals">
      <span className="timer-totals-main">
        {t.timer.totalLabel}: <strong>{formatHMS(total)}</strong>
      </span>
      {tags.map(([tag, s]) => (
        <span key={tag} className="timer-totals-tag">
          <span className="tag-chip">{tag}</span>
          <span className="timer-totals-time">{formatHMS(s)}</span>
        </span>
      ))}
    </div>
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

export default function TimeTracker({ tasks, onAdd, onOpen, onDelete, onMarkDone, onStart, onStop, search }: Props): React.JSX.Element {
  const t = useT()
  const searchQuery = search?.open ? search.query.trim() : ''
  const shownTasks = tasks.filter((tk) => matchesSearch(searchQuery, tk.title, tk.tag, tk.comments))
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (confirmingId === null) return
    confirmTimer.current = setTimeout(() => setConfirmingId(null), CONFIRM_TIMEOUT)
    return () => {
      if (confirmTimer.current !== null) clearTimeout(confirmTimer.current)
    }
  }, [confirmingId])

  return (
    <div className="task-list">
      <div className="list-sticky">
        <div className="task-list-header">
          <h1 className="task-list-title">{t.timer.listTitle}</h1>
          <button className="btn btn-primary" onClick={onAdd}>
            {t.timer.addTask}
          </button>
        </div>
        {search?.open && <SearchBar search={search} />}
        <TimerTotals tasks={tasks} />
      </div>

      {shownTasks.length === 0 ? (
        <p className="empty-state">{searchQuery !== '' ? t.taskList.noSearchResults : t.timer.empty}</p>
      ) : (
        <div className="timer-list">
          <div className="timer-list-head">
            <span className="timer-col-name">{t.timer.headerName}</span>
            <span className="timer-col-tag">{t.timer.headerTag}</span>
            <span className="timer-col-time">{t.timer.headerTime}</span>
            <span className="timer-col-actions" />
          </div>

          <ul className="timer-items">
            {shownTasks.map((task, index) => (
              <li
                key={task.id}
                className={`timer-row${task.started_at !== null ? ' timer-row--running' : ''}`}
                style={{ '--stagger': index } as React.CSSProperties}
                onClick={() => onOpen(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(task.id)}
              >
                <span className="timer-col-name">
                  {task.started_at !== null && <span className="timer-running-dot" aria-hidden="true" />}
                  {task.title}
                  {task.linked_task_id !== null && (
                    <span className="timer-linked-badge">{t.timer.linkedBadge}</span>
                  )}
                </span>
                <span className="timer-col-tag">
                  {task.tag ? <span className="tag-chip">{task.tag}</span> : '—'}
                </span>
                <TimerText
                  accumulated={task.accumulated_seconds}
                  startedAt={task.started_at}
                  className="timer-col-time timer-time"
                />
                <span className="timer-col-actions" onClick={(e) => e.stopPropagation()}>
                  {confirmingId === task.id ? (
                    <span className="timer-confirm">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { setConfirmingId(null); onDelete(task.id) }}
                      >
                        {t.taskCard.deleteYes}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingId(null)}>
                        {t.taskCard.deleteNo}
                      </button>
                    </span>
                  ) : (
                    <>
                      {task.started_at !== null ? (
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => onStop(task.id)}
                          aria-label={t.timer.stop}
                          title={t.timer.stop}
                        >
                          <StopIcon />
                        </button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => onStart(task.id)}
                          aria-label={t.timer.start}
                          title={t.timer.start}
                        >
                          <PlayIcon />
                        </button>
                      )}
                      <button
                        className="btn btn-success btn-icon"
                        onClick={() => onMarkDone(task.id)}
                        aria-label={t.taskCard.markDone}
                        title={t.taskCard.markDone}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => setConfirmingId(task.id)}
                        aria-label={t.taskCard.deleteTask}
                        title={t.taskCard.deleteTask}
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
