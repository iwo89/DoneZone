import React, { useState, useEffect } from 'react'
import { formatHMS, elapsedSeconds } from '../timeUtils'

interface Props {
  accumulated: number
  startedAt: string | null
  className?: string
}

export default function TimerText({ accumulated, startedAt, className }: Props): React.JSX.Element {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (startedAt === null) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return <span className={className}>{formatHMS(elapsedSeconds(accumulated, startedAt))}</span>
}
