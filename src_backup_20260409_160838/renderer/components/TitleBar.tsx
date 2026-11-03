import React, { useState, useEffect } from 'react'

function MinimizeIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <rect x="0" y="4.5" width="10" height="1.5" rx="0.75" />
    </svg>
  )
}

function MaximizeIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="0.7" y="0.7" width="8.6" height="8.6" rx="1" />
    </svg>
  )
}

function RestoreIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2.7" y="0.7" width="6.6" height="6.6" rx="0.8" />
      <path d="M0.7 3.3v5.3a1 1 0 0 0 1 1h5.3" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" />
      <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
    </svg>
  )
}

export default function TitleBar(): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    void window.windowAPI.isMaximized().then(setIsMaximized)
    window.windowAPI.onMaximizedChange(setIsMaximized)
  }, [])

  return (
    <div className="titlebar">
      <span className="titlebar-title">DoneZone</span>

      <div className="titlebar-controls">
        <button
          className="titlebar-btn titlebar-btn--min"
          onClick={() => void window.windowAPI.minimize()}
          aria-label="Minimize"
        >
          <MinimizeIcon />
        </button>
        <button
          className="titlebar-btn titlebar-btn--max"
          onClick={() => void window.windowAPI.maximize()}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button
          className="titlebar-btn titlebar-btn--close"
          onClick={() => void window.windowAPI.close()}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
