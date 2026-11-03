import React from 'react'
import { useT } from '../LanguageContext'

function ExpandIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <polyline points="3.5,1 1,1 1,3.5" />
      <polyline points="6.5,1 9,1 9,3.5" />
      <polyline points="1,6.5 1,9 3.5,9" />
      <polyline points="9,6.5 9,9 6.5,9" />
    </svg>
  )
}

function MinimizeIcon(): React.JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <rect x="0" y="4.5" width="10" height="1.5" rx="0.75" />
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

interface Props {
  onExit: () => void
  view: 'todo' | 'timer'
  onViewChange: (v: 'todo' | 'timer') => void
}

export default function WidgetBar({ onExit, view, onViewChange }: Props): React.JSX.Element {
  const t = useT()
  return (
    <div className="titlebar">
      <div className="widget-tabs">
        <button
          className={`widget-tab${view === 'todo' ? ' widget-tab--active' : ''}`}
          onClick={() => onViewChange('todo')}
        >
          {t.widget.tabTodo}
        </button>
        <button
          className={`widget-tab${view === 'timer' ? ' widget-tab--active' : ''}`}
          onClick={() => onViewChange('timer')}
        >
          {t.widget.tabTimer}
        </button>
      </div>
      <div className="titlebar-controls">
        <button className="widget-exit-btn" onClick={onExit} title={t.widget.exit}>
          <ExpandIcon />
          <span>{t.widget.exit}</span>
        </button>
        <button
          className="titlebar-btn titlebar-btn--min"
          onClick={() => void window.windowAPI.minimize()}
          aria-label={t.titlebar.minimize}
        >
          <MinimizeIcon />
        </button>
        <button
          className="titlebar-btn titlebar-btn--close"
          onClick={() => void window.windowAPI.close()}
          aria-label={t.titlebar.close}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
