export interface SearchState {
  open: boolean
  query: string
  onChange: (q: string) => void
  onClose: () => void
}

export function matchesSearch(query: string, ...fields: Array<string | null | undefined | string[]>): boolean {
  const q = query.trim().toLowerCase()
  if (q === '') return true
  return fields.some((f) => {
    if (f == null) return false
    const text = Array.isArray(f) ? f.join(' ') : f
    return text.toLowerCase().includes(q)
  })
}
