import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import type { Task } from '../../types/task'
import type { TimerTask } from '../../types/timer'
import TaskCard from './TaskCard'
import SearchBar from './SearchBar'
import { matchesSearch, type SearchState } from '../searchUtils'
import FilterBar, { type PriorityFilter, type SortKey } from './FilterBar'
import { formatHMS } from '../timeUtils'
import { useT } from '../LanguageContext'

const FILTERS_KEY = 'donezone-filters'

interface StoredFilters {
  priority: PriorityFilter
  tag: string | null
  sort: SortKey
}

const PRIORITY_VALUES = ['all', 'low', 'normal', 'high']
const SORT_VALUES = ['due_date', 'priority', 'created_at', 'manual']

function loadFilters(): StoredFilters {
  const fallback: StoredFilters = { priority: 'all', tag: null, sort: 'due_date' }
  try {
    const raw = localStorage.getItem(FILTERS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredFilters>
    return {
      priority: PRIORITY_VALUES.includes(parsed.priority as string) ? (parsed.priority as PriorityFilter) : 'all',
      tag: typeof parsed.tag === 'string' ? parsed.tag : null,
      sort: SORT_VALUES.includes(parsed.sort as string) ? (parsed.sort as SortKey) : 'due_date',
    }
  } catch {
    return fallback
  }
}

function TimerDoneTrashIcon(): React.JSX.Element {
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

function Watermark(): React.JSX.Element {
  return (
    <svg
      className="main-watermark"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="wm-sphere" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#d0e8ff" />
          <stop offset="40%"  stopColor="#5b9de0" />
          <stop offset="100%" stopColor="#0d2a6e" />
        </radialGradient>
        <radialGradient id="wm-gloss" cx="50%" cy="20%" r="55%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.80" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#a0c8ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#2060b0" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="110" rx="105" ry="105" stroke="url(#wm-ring)" strokeWidth="1.5" />
      <ellipse cx="110" cy="110" rx="94"  ry="94"  stroke="url(#wm-ring)" strokeWidth="1" />
      <ellipse cx="110" cy="110" rx="83"  ry="83"  stroke="url(#wm-ring)" strokeWidth="0.8" />
      <circle cx="110" cy="110" r="72" fill="url(#wm-sphere)" />
      <circle cx="110" cy="110" r="72" stroke="rgba(180,220,255,0.45)" strokeWidth="1.5" />
      <ellipse cx="110" cy="86" rx="42" ry="28" fill="url(#wm-gloss)" />
      <polyline
        points="78,112  100,136  142,88"
        stroke="white"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
    </svg>
  )
}

interface Props {
  search?: SearchState
  tasks: Task[]
  view: 'todo' | 'done'
  onAdd: () => void
  onEdit: (id: number) => void
  onMarkDone: (id: number) => void
  onDelete: (id: number) => void
  onReorder?: (ids: number[]) => Promise<void>
  timers?: Map<number, TimerTask>
  onTrackTime?: (id: number) => void
  onOpenTimer?: (timerId: number) => void
  doneTimers?: TimerTask[]
  onDeleteTimer?: (id: number) => void
  onOpenSettings?: () => void
}

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, normal: 1, low: 2 }
const DEFAULT_SORT: SortKey = 'due_date'
const COMPLETE_DURATION = 520

function applyFiltersAndSort(
  tasks: Task[],
  priority: PriorityFilter,
  tag: string | null,
  sort: SortKey,
): Task[] {
  let result = tasks

  if (priority !== 'all') {
    result = result.filter((t) => t.priority === priority)
  }
  if (tag !== null) {
    result = result.filter((t) => t.tags?.includes(tag) ?? false)
  }

  if (sort === 'manual') return result

  return [...result].sort((a, b) => {
    switch (sort) {
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      case 'created_at':
        return b.created_at.localeCompare(a.created_at)
    }
  })
}

export default function TaskList({
  tasks,
  view,
  onAdd,
  onEdit,
  onMarkDone,
  onDelete,
  onReorder,
  timers,
  onTrackTime,
  onOpenTimer,
  doneTimers,
  onDeleteTimer,
  onOpenSettings,
  search,
}: Props): React.JSX.Element {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(() => loadFilters().priority)
  const [tagFilter, setTagFilter] = useState<string | null>(() => loadFilters().tag)
  const [sortBy, setSortBy] = useState<SortKey>(() => loadFilters().sort)
  const [confirmingTimerId, setConfirmingTimerId] = useState<number | null>(null)
  const confirmTimerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [manualOrder, setManualOrder] = useState<number[] | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)
  const dragId = useRef<number | null>(null)
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (completeTimer.current !== null) clearTimeout(completeTimer.current)
      if (confirmTimerTimeout.current !== null) clearTimeout(confirmTimerTimeout.current)
    }
  }, [])

  useEffect(() => {
    if (confirmingTimerId === null) return
    confirmTimerTimeout.current = setTimeout(() => setConfirmingTimerId(null), 5000)
    return () => {
      if (confirmTimerTimeout.current !== null) clearTimeout(confirmTimerTimeout.current)
    }
  }, [confirmingTimerId])

  useEffect(() => {
    setConfirmingTimerId(null)
  }, [view])
  const t = useT()

  useEffect(() => {
    if (sortBy !== 'manual') {
      setManualOrder(null)
      return
    }
    setManualOrder((prev) => {
      if (prev === null) {
        return tasks.map((t) => t.id)
      }
      const taskIdSet = new Set(tasks.map((t) => t.id))
      const prevSet = new Set(prev)
      const kept = prev.filter((id) => taskIdSet.has(id))
      const added = tasks.filter((t) => !prevSet.has(t.id)).map((t) => t.id)
      return [...kept, ...added]
    })
  }, [sortBy, tasks])

  const availableTags = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [tasks])

  useEffect(() => {
    if (tasks.length > 0 && tagFilter !== null && !availableTags.includes(tagFilter)) {
      setTagFilter(null)
    }
  }, [tasks.length, availableTags, tagFilter])

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify({ priority: priorityFilter, tag: tagFilter, sort: sortBy }))
    } catch { }
  }, [priorityFilter, tagFilter, sortBy])

  const isFiltered = priorityFilter !== 'all' || tagFilter !== null

  function clearFilters(): void {
    setPriorityFilter('all')
    setTagFilter(null)
  }

  const handleMarkDone = useCallback((id: number): void => {
    if (completeTimer.current !== null) clearTimeout(completeTimer.current)
    setCompletingId(id)
    completeTimer.current = setTimeout(() => {
      setCompletingId(null)
      completeTimer.current = null
      onMarkDone(id)
    }, COMPLETE_DURATION)
  }, [onMarkDone])

  const handleEdit   = useCallback((id: number) => onEdit(id), [onEdit])
  const handleDelete = useCallback((id: number) => onDelete(id), [onDelete])

  function handleDragStart(id: number, e: React.DragEvent): void {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, id: number): void {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragId.current !== id) setDragOverId(id)
  }

  function handleDrop(targetId: number): void {
    const sourceId = dragId.current
    if (!sourceId || sourceId === targetId || !manualOrder) return

    const newOrder = [...manualOrder]
    const from = newOrder.indexOf(sourceId)
    const to = newOrder.indexOf(targetId)
    if (from < 0 || to < 0) return

    newOrder.splice(from, 1)
    newOrder.splice(to, 0, sourceId)
    setManualOrder(newOrder)
    setDragOverId(null)
    dragId.current = null
    void onReorder?.(newOrder)
  }

  function handleDragEnd(): void {
    dragId.current = null
    setDragOverId(null)
  }

  const searchQuery = search?.open ? search.query.trim() : ''
  const isSearching = searchQuery !== ''

  const displayedTasks = useMemo(() => {
    const base = computeDisplayed()
    if (searchQuery === '') return base
    return base.filter((tk) => matchesSearch(searchQuery, tk.title, tk.description, tk.tags))
  }, [tasks, priorityFilter, tagFilter, sortBy, manualOrder, searchQuery])

  function computeDisplayed(): Task[] {
    if (sortBy === 'manual' && manualOrder !== null) {
      const taskMap = new Map(tasks.map((t) => [t.id, t]))
      return manualOrder
        .map((id) => taskMap.get(id))
        .filter((t): t is Task => t !== undefined)
        .filter(
          (t) =>
            (priorityFilter === 'all' || t.priority === priorityFilter) &&
            (tagFilter === null || (t.tags?.includes(tagFilter) ?? false)),
        )
    }
    return applyFiltersAndSort(tasks, priorityFilter, tagFilter, sortBy)
  }

  const shownDoneTimers = useMemo(
    () => (doneTimers ?? []).filter((tt) => matchesSearch(searchQuery, tt.title, tt.tag, tt.comments)),
    [doneTimers, searchQuery],
  )

  const emptyMessage = useMemo(() => {
    if (isSearching) return t.taskList.noSearchResults
    if (view === 'done') return t.taskList.emptyDone
    if (tasks.length === 0) return t.taskList.emptyTodo
    return t.taskList.emptyFiltered
  }, [view, tasks.length, t.taskList, isSearching])

  const isManualSort = sortBy === 'manual' && view === 'todo' && !isSearching

  return (
    <div className="task-list">
      <Watermark />
      <div className="list-sticky">
        <div className="task-list-header">
          <h1 className="task-list-title">{view === 'todo' ? t.taskList.titleTodo : t.taskList.titleDone}</h1>
          {view === 'todo' && (
            <button className="btn btn-primary" onClick={onAdd}>
              {t.taskList.addTask}
            </button>
          )}
        </div>

        {search?.open && <SearchBar search={search} />}

        {view === 'todo' && (
          <FilterBar
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            tagFilter={tagFilter}
            onTagChange={setTagFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableTags={availableTags}
            isFiltered={isFiltered}
            onClear={clearFilters}
          />
        )}
      </div>

      {displayedTasks.length === 0 && (view !== 'done' || shownDoneTimers.length === 0) ? (
        view === 'todo' && tasks.length === 0 && !isSearching && onOpenSettings ? (
          <div className="empty-onboarding">
            <h2 className="empty-onboarding-title">{t.taskList.onboardTitle}</h2>
            <ul className="empty-onboarding-list">
              <li>{t.taskList.onboardAdd}</li>
              <li>{t.taskList.onboardWidget}</li>
            </ul>
            <button className="btn btn-ghost btn-sm" onClick={onOpenSettings}>
              {t.taskList.onboardSettings}
            </button>
          </div>
        ) : (
          <p className="empty-state">{emptyMessage}</p>
        )
      ) : (
        <ul className="task-items">
          {displayedTasks.map((task, index) => (
            <li
              key={task.id}
              className={[
                completingId === task.id ? 'task-item--completing' : '',
                isManualSort ? 'task-item--draggable' : '',
                dragOverId === task.id ? 'task-item--drag-over' : '',
              ].filter(Boolean).join(' ')}
              style={{ '--stagger': index } as React.CSSProperties}
              draggable={isManualSort}
              onDragStart={isManualSort ? (e) => handleDragStart(task.id, e) : undefined}
              onDragOver={isManualSort ? (e) => handleDragOver(e, task.id) : undefined}
              onDrop={isManualSort ? () => handleDrop(task.id) : undefined}
              onDragEnd={isManualSort ? handleDragEnd : undefined}
            >
              <TaskCard
                task={task}
                showMarkDone={view === 'todo'}
                completing={completingId === task.id}
                draggable={isManualSort}
                onEdit={handleEdit}
                onMarkDone={handleMarkDone}
                onDelete={handleDelete}
                linkedTimer={timers?.get(task.id) ?? null}
                onTrackTime={onTrackTime}
                onOpenTimer={onOpenTimer}
              />
            </li>
          ))}
          {view === 'done' && shownDoneTimers.map((tt, i) => (
            <li key={`timer-${tt.id}`} style={{ '--stagger': displayedTasks.length + i } as React.CSSProperties}>
              <div
                className="task-card task-card--timer"
                onClick={() => onOpenTimer?.(tt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenTimer?.(tt.id)}
              >
                <div className="task-card-body">
                  <span className="task-title">{tt.title}</span>
                  {tt.comments && <span className="task-description">{tt.comments}</span>}
                  <div className="task-meta">
                    <span className="timer-linked-badge">{t.timer.trackerBadge}</span>
                    {tt.tag && <span className="tag-chip">{tt.tag}</span>}
                    <span className="timer-chip timer-chip--static">{formatHMS(tt.accumulated_seconds)}</span>
                  </div>
                </div>
                <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
                  {confirmingTimerId === tt.id ? (
                    <div className="task-card-confirm">
                      <span className="task-card-confirm-label">{t.taskCard.deleteConfirm}</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { setConfirmingTimerId(null); onDeleteTimer?.(tt.id) }}
                      >
                        {t.taskCard.deleteYes}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingTimerId(null)}>
                        {t.taskCard.deleteNo}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => setConfirmingTimerId(tt.id)}
                      aria-label={t.taskCard.deleteTask}
                      title={t.taskCard.deleteTask}
                    >
                      <TimerDoneTrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
