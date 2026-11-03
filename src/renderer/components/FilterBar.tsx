import React from 'react'
import type { Task } from '../../types/task'
import { useT } from '../LanguageContext'

export type PriorityFilter = 'all' | Task['priority']
export type SortKey = 'due_date' | 'priority' | 'created_at' | 'manual'

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
  const t = useT()

  const priorityOptions: { value: PriorityFilter; label: string }[] = [
    { value: 'all',    label: t.filterBar.all },
    { value: 'low',    label: t.filterBar.low },
    { value: 'normal', label: t.filterBar.normal },
    { value: 'high',   label: t.filterBar.high },
  ]

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'due_date',   label: t.filterBar.sortDueDate },
    { value: 'priority',   label: t.filterBar.sortPriority },
    { value: 'created_at', label: t.filterBar.sortCreated },
    { value: 'manual',     label: t.filterBar.sortManual },
  ]

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">{t.filterBar.labelPriority}</span>
        <div className="btn-group">
          {priorityOptions.map((opt) => (
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
        <span className="filter-label">{t.filterBar.labelTag}</span>
        <select
          className="filter-select"
          value={tagFilter ?? ''}
          onChange={(e) => onTagChange(e.target.value || null)}
          disabled={availableTags.length === 0}
        >
          <option value="">{t.filterBar.allTags}</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--sort">
        <span className="filter-label">{t.filterBar.labelSort}</span>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <button className="filter-clear" onClick={onClear}>
          {t.filterBar.clearFilters}
        </button>
      )}

      {sortBy !== 'manual' && (
        <span className="filter-hint">{t.filterBar.manualHint}</span>
      )}
    </div>
  )
}
