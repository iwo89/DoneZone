export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const hms = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return d > 0 ? `${d}d ${hms}` : hms
}

export function elapsedSeconds(accumulated: number, startedAt: string | null): number {
  if (startedAt === null) return accumulated
  return accumulated + Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
}
