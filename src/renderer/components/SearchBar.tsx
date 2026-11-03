import React, { useEffect, useRef } from 'react'
import type { SearchState } from '../searchUtils'
import { useT } from '../LanguageContext'

export default function SearchBar({ search }: { search: SearchState }): React.JSX.Element {
  const t = useT()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div className="search-bar" role="search">
      <input
        ref={inputRef}
        className="form-input search-bar-input"
        type="text"
        placeholder={t.search.placeholder}
        aria-label={t.search.placeholder}
        value={search.query}
        maxLength={200}
        onChange={(e) => search.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            search.onClose()
          }
        }}
      />
      <button className="btn btn-ghost btn-sm" onClick={search.onClose} aria-label={t.search.close} title={t.search.close}>
        ×
      </button>
    </div>
  )
}
