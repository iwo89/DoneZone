import React, { useState, useEffect, useRef } from 'react'
import { useT } from '../LanguageContext'
import { useTheme } from '../ThemeContext'

function TodoIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-todo-face" x1="4" y1="2" x2="23" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#72befe" />
          <stop offset="1" stopColor="#1358d4" />
        </linearGradient>
      </defs>
      <ellipse cx="15" cy="30" rx="9" ry="1.6" fill="rgba(0,0,60,0.30)" />
      <path d="M23 4.5 L27 2.5 L27 25.5 L23 27.5 Z" fill="#0c3aa0" />
      <path d="M4 4.5 L8 2.5 L27 2.5 L23 4.5 Z" fill="rgba(165,215,255,0.55)" />
      <rect x="4" y="4.5" width="19" height="23" rx="2.5" fill="url(#icn-todo-face)" />
      <rect x="11.5" y="2" width="8" height="4.5" rx="2" fill="#0a2c8a" />
      <rect x="11.5" y="2" width="8" height="4.5" rx="2"
        fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.6" />
      <rect x="4" y="4.5" width="19" height="10" rx="2.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="8.5" cy="13.5" r="1.3" fill="rgba(255,255,255,0.90)" />
      <line x1="12" y1="13.5" x2="20.5" y2="13.5"
        stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="18" r="1.3" fill="rgba(255,255,255,0.72)" />
      <line x1="12" y1="18" x2="19.5" y2="18"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="22.5" r="1.3" fill="rgba(255,255,255,0.55)" />
      <line x1="12" y1="22.5" x2="20.5" y2="22.5"
        stroke="rgba(255,255,255,0.58)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DoneIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-done-bg" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5cdea0" />
          <stop offset="1" stopColor="#0b7c3e" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,40,10,0.30)" />
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-done-bg)" />
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z"
        fill="rgba(255,255,255,0.32)" />
      <polyline points="9.5,15 14.5,20 23,10"
        stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GearIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-gear-bg" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#92c8f4" />
          <stop offset="1" stopColor="#1e5cac" />
        </linearGradient>
        <linearGradient id="icn-gear-hole" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a56a8" />
          <stop offset="1" stopColor="#0c2e70" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,0,60,0.28)" />
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-gear-bg)" />
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z"
        fill="rgba(255,255,255,0.28)" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <rect
          key={deg}
          x="15" y="6.5" width="2" height="3.5" rx="1"
          fill="rgba(255,255,255,0.82)"
          transform={`rotate(${deg} 16 15)`}
        />
      ))}
      <circle cx="16" cy="15" r="3.5" fill="url(#icn-gear-hole)" />
      <circle cx="16" cy="15" r="3.5" stroke="rgba(255,255,255,0.30)" strokeWidth="0.7" />
    </svg>
  )
}

function TimerIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-timer-bg" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d0a8f4" />
          <stop offset="1" stopColor="#6a28b0" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(20,0,60,0.30)" />
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-timer-bg)" />
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z" fill="rgba(255,255,255,0.30)" />
      <circle cx="16" cy="15" r="8.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
      <line x1="16" y1="15" x2="16" y2="9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="15" x2="20" y2="17.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="15" r="1.4" fill="white" />
    </svg>
  )
}

function FlatTimerIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  )
}

function FlatTodoIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  )
}

function FlatDoneIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

function FlatGearIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  )
}

function WidgetIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-widget-bg" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a0c8f4" />
          <stop offset="1" stopColor="#1e5cac" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,0,60,0.28)" />
      <rect x="4" y="6" width="24" height="19" rx="2.5" fill="url(#icn-widget-bg)" />
      <rect x="4" y="6" width="24" height="19" rx="2.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      <path d="M4 6 Q16 3 28 6 Q24 12 16 11.5 Q8 12 4 6 Z" fill="rgba(255,255,255,0.26)" />
      <rect x="17" y="16" width="9" height="7" rx="1.5" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.50)" strokeWidth="0.7" />
      <line x1="19" y1="19" x2="24" y2="19" stroke="rgba(255,255,255,0.80)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="21" x2="23" y2="21" stroke="rgba(255,255,255,0.55)" strokeWidth="1.0" strokeLinecap="round" />
    </svg>
  )
}

function FlatWidgetIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/>
      <path d="M13 11h5v3h-5z"/>
    </svg>
  )
}

function SearchIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-search-bg" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9fe3d6" />
          <stop offset="1" stopColor="#12806e" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,50,40,0.28)" />
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-search-bg)" />
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z" fill="rgba(255,255,255,0.28)" />
      <circle cx="14.5" cy="13.5" r="5" stroke="white" strokeWidth="2.2" fill="none" />
      <line x1="18.3" y1="17.3" x2="22.5" y2="21.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function FlatSearchIcon(): React.JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  )
}

interface Props {
  view: 'todo' | 'done' | 'timer'
  onViewChange: (v: 'todo' | 'done' | 'timer') => void
  todoCount: number
  urgentCount: number
  onSettingsClick: () => void
  onWidgetClick: () => void
  onSearchClick: () => void
  searchActive: boolean
}

export default function TopNav({
  view,
  onViewChange,
  todoCount,
  urgentCount,
  onSettingsClick,
  onWidgetClick,
  onSearchClick,
  searchActive,
}: Props): React.JSX.Element {
  const t = useT()
  const { theme } = useTheme()
  const isFlat = theme === 'flat' || theme === 'peachy'
  const prevCount = useRef(todoCount)
  const [badgePulseKey, setBadgePulseKey] = useState(0)
  useEffect(() => {
    if (todoCount !== prevCount.current) {
      setBadgePulseKey((k) => k + 1)
      prevCount.current = todoCount
    }
  }, [todoCount])

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <button
          className="topnav-item topnav-item--widget"
          onClick={onWidgetClick}
          title={t.widget.enter}
          aria-label={t.widget.enter}
        >
          <div className="topnav-icon">
            {isFlat ? <FlatWidgetIcon /> : <WidgetIcon3D />}
          </div>
          <span className="topnav-label">{t.widget.enter}</span>
        </button>
      </div>

      <div className="topnav-items">
        <button
          className={`topnav-item${view === 'todo' ? ' topnav-item--active' : ''}`}
          onClick={() => onViewChange('todo')}
        >
          <div className="topnav-icon">
            {isFlat ? <FlatTodoIcon /> : <TodoIcon3D />}
            {todoCount > 0 && (
              <span
                key={badgePulseKey}
                className="topnav-badge"
                aria-label={t.nav.todoCount(todoCount)}
              >
                {todoCount}
              </span>
            )}
            {urgentCount > 0 && (
              <span className="topnav-urgent-dot" aria-hidden="true" />
            )}
          </div>
          <span className="topnav-label">{t.nav.todo}</span>
        </button>

        <button
          className={`topnav-item${view === 'done' ? ' topnav-item--active' : ''}`}
          onClick={() => onViewChange('done')}
        >
          <div className="topnav-icon">
            {isFlat ? <FlatDoneIcon /> : <DoneIcon3D />}
          </div>
          <span className="topnav-label">{t.nav.done}</span>
        </button>

        <button
          className={`topnav-item${view === 'timer' ? ' topnav-item--active' : ''}`}
          onClick={() => onViewChange('timer')}
        >
          <div className="topnav-icon">
            {isFlat ? <FlatTimerIcon /> : <TimerIcon3D />}
          </div>
          <span className="topnav-label">{t.nav.timeTracker}</span>
        </button>

        <button className="topnav-item" onClick={onSettingsClick}>
          <div className="topnav-icon">
            {isFlat ? <FlatGearIcon /> : <GearIcon3D />}
          </div>
          <span className="topnav-label">{t.nav.settings}</span>
        </button>

      </div>

      <div className="topnav-right">
        <button
          className={`topnav-item topnav-item--search${searchActive ? ' topnav-item--active' : ''}`}
          onClick={onSearchClick}
          title={`${t.nav.search} (Ctrl+F)`}
          aria-label={t.nav.search}
          aria-pressed={searchActive}
        >
          <div className="topnav-icon">
            {isFlat ? <FlatSearchIcon /> : <SearchIcon3D />}
          </div>
          <span className="topnav-label">{t.nav.search}</span>
        </button>
      </div>
    </nav>
  )
}
