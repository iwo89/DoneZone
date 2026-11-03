import React from 'react'

// ── 3D Icons ──────────────────────────────────────────────────────────────────
// Each icon uses: gradient base shape → gloss arc → symbol → ground shadow.
// SVG gradient IDs are unique per icon type; each appears exactly once in the DOM.

function TodoIcon3D(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="icn-todo-face" x1="4" y1="2" x2="23" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#72befe" />
          <stop offset="1" stopColor="#1358d4" />
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="15" cy="30" rx="9" ry="1.6" fill="rgba(0,0,60,0.30)" />
      {/* Right depth face (3-D thickness) */}
      <path d="M23 4.5 L27 2.5 L27 25.5 L23 27.5 Z" fill="#0c3aa0" />
      {/* Top face */}
      <path d="M4 4.5 L8 2.5 L27 2.5 L23 4.5 Z" fill="rgba(165,215,255,0.55)" />
      {/* Front face */}
      <rect x="4" y="4.5" width="19" height="23" rx="2.5" fill="url(#icn-todo-face)" />
      {/* Clipboard clip */}
      <rect x="11.5" y="2" width="8" height="4.5" rx="2" fill="#0a2c8a" />
      <rect x="11.5" y="2" width="8" height="4.5" rx="2"
        fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.6" />
      {/* Gloss on front face */}
      <rect x="4" y="4.5" width="19" height="10" rx="2.5" fill="rgba(255,255,255,0.18)" />
      {/* List rows — checkbox dot + line */}
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
      {/* Ground shadow */}
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,40,10,0.30)" />
      {/* Circle body */}
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-done-bg)" />
      {/* Rim highlight */}
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
      {/* Gloss arc (top-left highlight) */}
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z"
        fill="rgba(255,255,255,0.32)" />
      {/* Checkmark */}
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
      {/* Ground shadow */}
      <ellipse cx="16" cy="30" rx="9" ry="1.6" fill="rgba(0,0,60,0.28)" />
      {/* Circle body */}
      <circle cx="16" cy="15" r="12.5" fill="url(#icn-gear-bg)" />
      <circle cx="16" cy="15" r="12.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      {/* Gloss arc */}
      <path d="M7.5 9 Q16 4.5 24.5 9 Q20 15 16 14.5 Q12 15 7.5 9 Z"
        fill="rgba(255,255,255,0.28)" />
      {/* Gear teeth — 6 rounded rectangles rotated around centre */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <rect
          key={deg}
          x="15" y="6.5" width="2" height="3.5" rx="1"
          fill="rgba(255,255,255,0.82)"
          transform={`rotate(${deg} 16 15)`}
        />
      ))}
      {/* Hub circle (re-uses body gradient to "punch through") */}
      <circle cx="16" cy="15" r="3.5" fill="url(#icn-gear-hole)" />
      <circle cx="16" cy="15" r="3.5" stroke="rgba(255,255,255,0.30)" strokeWidth="0.7" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  view: 'todo' | 'done'
  onViewChange: (v: 'todo' | 'done') => void
  todoCount: number
  onSettingsClick: () => void
}

export default function TopNav({
  view,
  onViewChange,
  todoCount,
  onSettingsClick,
}: Props): React.JSX.Element {
  return (
    <nav className="topnav">
      <div className="topnav-items">
        <button
          className={`topnav-item${view === 'todo' ? ' topnav-item--active' : ''}`}
          onClick={() => onViewChange('todo')}
        >
          <div className="topnav-icon">
            <TodoIcon3D />
            {todoCount > 0 && (
              <span className="topnav-badge" aria-label={`${todoCount} tasks`}>
                {todoCount}
              </span>
            )}
          </div>
          <span className="topnav-label">To Do</span>
        </button>

        <button
          className={`topnav-item${view === 'done' ? ' topnav-item--active' : ''}`}
          onClick={() => onViewChange('done')}
        >
          <div className="topnav-icon">
            <DoneIcon3D />
          </div>
          <span className="topnav-label">Done</span>
        </button>

        <button className="topnav-item" onClick={onSettingsClick}>
          <div className="topnav-icon">
            <GearIcon3D />
          </div>
          <span className="topnav-label">Settings</span>
        </button>
      </div>
    </nav>
  )
}
