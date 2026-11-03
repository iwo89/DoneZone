import React, { useState, useMemo, useEffect } from 'react'
import type { Task } from '../../types/task'
import TaskCard from './TaskCard'
import FilterBar, { type PriorityFilter, type SortKey } from './FilterBar'

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

      <circle cx="110" cy="110" r="72"
        stroke="rgba(180,220,255,0.45)" strokeWidth="1.5" />

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
  tasks: Task[]
  view: 'todo' | 'done'
  onAdd: () => void
  onEdit: (task: Task) => void
  onMarkDone: (id: number) => void
  onDelete: (id: number) => void
}

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, normal: 1, low: 2 }

const DEFAULT_SORT: SortKey = 'due_date'

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
}: Props): React.JSX.Element {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>(DEFAULT_SORT)

  const availableTags = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [tasks])

  useEffect(() => {
    if (tagFilter !== null && !availableTags.includes(tagFilter)) {
      setTagFilter(null)
    }
  }, [availableTags, tagFilter])

  const isFiltered = priorityFilter !== 'all' || tagFilter !== null

  function clearFilters(): void {
    setPriorityFilter('all')
    setTagFilter(null)
  }

  const displayedTasks = useMemo(
    () => applyFiltersAndSort(tasks, priorityFilter, tagFilter, sortBy),
    [tasks, priorityFilter, tagFilter, sortBy],
  )

  function emptyMessage(): string {
    if (view === 'done') return 'Nothing completed yet.'
    if (tasks.length === 0) return 'No tasks yet — hit "Add Task" to get started.'
    return 'No tasks match the current filters.'
  }

  return (
    <div className="task-list">
      <Watermark />
      <div className="task-list-header">
        <h1 className="task-list-title">{view === 'todo' ? 'To Do' : 'Done'}</h1>
        {view === 'todo' && (
          <button className="btn btn-primary" onClick={onAdd}>
            + Add Task
          </button>
        )}
      </div>

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

      {displayedTasks.length === 0 ? (
        <p className="empty-state">{emptyMessage()}</p>
      ) : (
        <ul className="task-items">
          {displayedTasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                showMarkDone={view === 'todo'}
                onEdit={() => onEdit(task)}
                onMarkDone={() => onMarkDone(task.id)}
                onDelete={() => onDelete(task.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
