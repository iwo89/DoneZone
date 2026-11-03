import React, { useState } from 'react'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ value, onChange }: Props): React.JSX.Element {
  const [input, setInput] = useState('')

  function commit(): void {
    const trimmed = input.trim().replace(/,+$/, '').trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="tag-input-wrapper">
      {value.map((tag) => (
        <span key={tag} className="tag-chip tag-chip--removable">
          {tag}
          <button
            type="button"
            className="tag-chip-remove"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        type="text"
        placeholder={value.length === 0 ? 'Add tags…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    </div>
  )
}
