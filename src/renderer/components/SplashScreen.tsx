import React, { useEffect, useRef, useState } from 'react'
import { useT } from '../LanguageContext'

const TASKS_COUNT   = 4
const TICK_START    = 420
const TICK_INTERVAL = 290
const SPIN_DELAY    = TICK_START + TASKS_COUNT * TICK_INTERVAL + 280
const EXIT_DELAY    = SPIN_DELAY + 460
const DONE_DELAY    = SPIN_DELAY + 740

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props): React.JSX.Element {
  const t = useT()
  const tasks = t.splash.tasks
  const [checkedCount, setCheckedCount] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [exiting, setExiting] = useState(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    document.getElementById('pre-splash')?.remove()

    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 0; i < TASKS_COUNT; i++) {
      timers.push(
        setTimeout(() => setCheckedCount(i + 1), TICK_START + i * TICK_INTERVAL)
      )
    }

    timers.push(setTimeout(() => setSpinning(true), SPIN_DELAY))
    timers.push(setTimeout(() => setExiting(true),  EXIT_DELAY))
    timers.push(setTimeout(() => onDoneRef.current(), DONE_DELAY))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`splash${exiting ? ' splash--exiting' : ''}`}>
      <div className="splash-scene">
        <div className={`splash-clipboard${spinning ? ' splash-clipboard--spinning' : ''}`}>

          <div className="splash-clip">
            <div className="splash-clip-arch" />
            <div className="splash-clip-bar" />
            <div className="splash-clip-hole" />
          </div>

          <div className="splash-board">
            <div className="splash-paper">
              {tasks.map((task, i) => (
                <div key={task} className="splash-row">
                  <div className={`splash-cb${checkedCount > i ? ' splash-cb--checked' : ''}`}>
                    {checkedCount > i && (
                      <svg className="splash-cb-svg" viewBox="0 0 14 14" fill="none">
                        <polyline
                          className="splash-cb-mark"
                          points="2,7.5 5.5,11 12,3"
                          stroke="#fff"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div
                    className={`splash-line${checkedCount > i ? ' splash-line--done' : ''}`}
                    style={{ width: `${52 + (i * 17) % 32}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className={`splash-brand${checkedCount >= TASKS_COUNT ? ' splash-brand--visible' : ''}`}>
          DoneZone
        </div>
      </div>
    </div>
  )
}
