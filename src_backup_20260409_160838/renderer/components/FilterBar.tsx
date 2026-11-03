import React from 'react'
import type { Task } from '../../types/task'

export type PriorityFilter = 'all' | Task['priority']
export type SortKey = 'due_date' | 'priority' | 'created_at'

interface Props {
  priorityFilter: PriorityFilter
  onPriorityChange: (p: PriorityFilter) => void
  tagFilter: string | null
  onTagChange: (t: string | null) => void
  sortBy: SortKey
  onSortChange: (s: SortKey) => void
  availableTags: string[]
  isFiltered: boolean
  onClear: () => void
}

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Created Date' },
]

export default function FilterBar({
  priorityFilter,
  onPriorityChange,
  tagFilter,
  onTagChange,
  sortBy,
  onSortChange,
  availableTags,
  isFiltered,
  onClear,
}: Props): React.JSX.Element {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Priority</span>
        <div className="btn-group">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`btn-group-item${priorityFilter === opt.value ? ' btn-group-item--active' : ''}`}
              onClick={() => onPriorityChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Tag</span>
        <select
          className="filter-select"
          value={tagFilter ?? ''}
          onChange={(e) => onTagChange(e.target.value || null)}
          disabled={availableTags.length === 0}
        >
          <option value="">All tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--sort">
        <span className="filter-label">Sort by</span>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <button className="filter-clear" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  )
}
