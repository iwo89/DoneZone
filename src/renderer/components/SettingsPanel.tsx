import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { UpdateState } from '../../types/updater'
import type { Language } from '../i18n'
import { useT, useLang } from '../LanguageContext'
import { useFocusTrap } from '../useFocusTrap'
import { type Theme, useTheme } from '../ThemeContext'

type SettingsSection = 'general' | 'tips' | 'updates' | 'backup'

interface Props {
  closing: boolean
  onClose: () => void
}

function Tip({ text }: { text: string }): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)

  function show(): void {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const tipWidth = 260
    const left = Math.max(8, r.right - tipWidth)
    const top = r.bottom + 6
    setStyle({ top, left, width: tipWidth })
    setVisible(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        className="settings-tooltip-icon"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        aria-label="More information"
        type="button"
      >?</button>
      {visible && createPortal(
        <div className="settings-tooltip-popup" style={style}>{text}</div>,
        document.body
      )}
    </>
  )
}

export default function SettingsPanel({ closing, onClose }: Props): React.JSX.Element {
  const t = useT()
  const { lang, setLang } = useLang()
  const { theme, setTheme } = useTheme()
  const trapRef = useFocusTrap<HTMLDivElement>()
  const [section, setSection] = useState<SettingsSection>('general')

  const [openAtLogin, setOpenAtLogin] = useState(false)
  const [closeToTray, setCloseToTray] = useState(false)
  const [startMinimized, setStartMinimized] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [widgetAlwaysOnTop, setWidgetAlwaysOnTop] = useState(true)
  const [loadingGeneral, setLoadingGeneral] = useState(true)

  const [appVersion, setAppVersion] = useState('')
  const [updaterState, setUpdaterState] = useState<UpdateState>({ status: 'idle' })

  const [backupResult, setBackupResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [importConfirmReplace, setImportConfirmReplace] = useState(false)

  useEffect(() => {
    if (!importConfirmReplace) return
    const timer = setTimeout(() => setImportConfirmReplace(false), 5000)
    return () => clearTimeout(timer)
  }, [importConfirmReplace])

  useEffect(() => {
    Promise.all([
      window.settingsAPI.getOpenAtLogin(),
      window.settingsAPI.getNotificationsEnabled(),
      window.settingsAPI.getCloseToTray(),
      window.settingsAPI.getStartMinimized(),
      window.settingsAPI.getWidgetAlwaysOnTop(),
    ]).then(([login, notifs, toTray, minimized, aot]) => {
      setOpenAtLogin(login)
      setNotificationsEnabled(notifs)
      setCloseToTray(toTray)
      setStartMinimized(minimized)
      setWidgetAlwaysOnTop(aot)
    }).catch(() => {}).finally(() => setLoadingGeneral(false))
  }, [])

  useEffect(() => {
    window.updaterAPI.getAppVersion().then(setAppVersion).catch(() => {})
    window.updaterAPI.getState().then(setUpdaterState).catch(() => {})
    return window.updaterAPI.onStatusChange(setUpdaterState)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleToggle(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const enabled = e.target.checked
    setOpenAtLogin(enabled)
    await window.settingsAPI.setOpenAtLogin(enabled)
  }

  async function handleNotificationsToggle(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const enabled = e.target.checked
    setNotificationsEnabled(enabled)
    await window.settingsAPI.setNotificationsEnabled(enabled)
  }

  async function handleCloseToTrayToggle(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const enabled = e.target.checked
    setCloseToTray(enabled)
    await window.settingsAPI.setCloseToTray(enabled)
  }

  async function handleStartMinimizedToggle(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const enabled = e.target.checked
    setStartMinimized(enabled)
    await window.settingsAPI.setStartMinimized(enabled)
  }

  async function handleWidgetAlwaysOnTopToggle(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const enabled = e.target.checked
    setWidgetAlwaysOnTop(enabled)
    await window.settingsAPI.setWidgetAlwaysOnTop(enabled)
  }

  async function handleExport(): Promise<void> {
    setBackupResult(null)
    const result = await window.backupAPI.exportTasks()
    if (result.success) {
      setBackupResult({ ok: true, msg: t.settings.exportSuccess(result.count ?? 0) })
    } else if (!result.canceled) {
      setBackupResult({ ok: false, msg: result.error ?? t.settings.exportError })
    }
  }

  async function handleImport(replace: boolean): Promise<void> {
    setBackupResult(null)
    setImportConfirmReplace(false)
    const result = await window.backupAPI.importTasks(replace)
    if (result.error) {
      setBackupResult({ ok: false, msg: result.error })
    } else if (result.imported > 0) {
      setBackupResult({ ok: true, msg: t.settings.importSuccess(result.imported) })
    } else if (!result.canceled) {
      setBackupResult({ ok: false, msg: t.settings.importNothing })
    }
  }

  const toggleId = 'setting-open-at-login'
  const startMinimizedId = 'setting-start-minimized'
  const closeToTrayId = 'setting-close-to-tray'
  const notifToggleId = 'setting-notifications'
  const widgetAlwaysOnTopId = 'setting-widget-always-on-top'
  const langSelectId = 'setting-language'
  const themeSelectId = 'setting-theme'

  return (
    <div className={`modal-overlay${closing ? ' modal-overlay--closing' : ''}`} onClick={onClose}>
      <div
        ref={trapRef}
        className={`modal settings-modal${closing ? ' modal--closing settings-modal--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.settings.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{t.settings.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t.settings.close}>×</button>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item${section === 'general' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('general')}
            >
              {t.settings.navGeneral}
            </button>
            <button
              className={`settings-nav-item${section === 'backup' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('backup')}
            >
              {t.settings.navBackup}
            </button>
            <button
              className={`settings-nav-item${section === 'tips' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('tips')}
            >
              {t.settings.navTips}
            </button>
            <button
              className={`settings-nav-item${section === 'updates' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('updates')}
            >
              {t.settings.navUpdates}
            </button>
          </nav>

          <div className="settings-content">
            {section === 'general' && (
              <div className="settings-pane">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={themeSelectId}>
                        {t.settings.labelTheme}
                      </label>
                      <Tip text={t.settings.tipTheme} />
                    </div>
                  </div>
                  <select
                    id={themeSelectId}
                    className="filter-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                  >
                    <option value="xp">{t.settings.themeXP}</option>
                    <option value="dark">{t.settings.themeDark}</option>
                    <option value="flat">{t.settings.themeFlat}</option>
                    <option value="peachy">{t.settings.themePeachy}</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={langSelectId}>
                        {t.settings.labelLanguage}
                      </label>
                      <Tip text={t.settings.tipLanguage} />
                    </div>
                  </div>
                  <select
                    id={langSelectId}
                    className="filter-select"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Language)}
                  >
                    <option value="en">{t.settings.langEnglish}</option>
                    <option value="pl">{t.settings.langPolish}</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={toggleId}>
                        {t.settings.labelOpenAtLogin}
                      </label>
                      <Tip text={t.settings.tipOpenAtLogin} />
                    </div>
                    <p className="settings-row-description">{t.settings.descOpenAtLogin}</p>
                  </div>
                  <label className="toggle" aria-label={t.settings.labelOpenAtLogin}>
                    <input
                      id={toggleId}
                      type="checkbox"
                      checked={openAtLogin}
                      onChange={handleToggle}
                      disabled={loadingGeneral}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className={`settings-row${!openAtLogin ? ' settings-row--disabled' : ''}`}>
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={startMinimizedId}>
                        {t.settings.labelStartMinimized}
                      </label>
                      <Tip text={t.settings.tipStartMinimized} />
                    </div>
                    <p className="settings-row-description">{t.settings.descStartMinimized}</p>
                  </div>
                  <label className="toggle" aria-label={t.settings.labelStartMinimized}>
                    <input
                      id={startMinimizedId}
                      type="checkbox"
                      checked={startMinimized}
                      onChange={handleStartMinimizedToggle}
                      disabled={loadingGeneral || !openAtLogin}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={closeToTrayId}>
                        {t.settings.labelCloseToTray}
                      </label>
                      <Tip text={t.settings.tipCloseToTray} />
                    </div>
                    <p className="settings-row-description">{t.settings.descCloseToTray}</p>
                  </div>
                  <label className="toggle" aria-label={t.settings.labelCloseToTray}>
                    <input
                      id={closeToTrayId}
                      type="checkbox"
                      checked={closeToTray}
                      onChange={handleCloseToTrayToggle}
                      disabled={loadingGeneral}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={notifToggleId}>
                        {t.settings.labelNotifications}
                      </label>
                      <Tip text={t.settings.tipNotifications} />
                    </div>
                    <p className="settings-row-description">{t.settings.descNotifications}</p>
                  </div>
                  <label className="toggle" aria-label={t.settings.labelNotifications}>
                    <input
                      id={notifToggleId}
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={handleNotificationsToggle}
                      disabled={loadingGeneral}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <div className="settings-label-row">
                      <label className="settings-row-label" htmlFor={widgetAlwaysOnTopId}>
                        {t.settings.labelWidgetAlwaysOnTop}
                      </label>
                      <Tip text={t.settings.tipWidgetAlwaysOnTop} />
                    </div>
                    <p className="settings-row-description">{t.settings.descWidgetAlwaysOnTop}</p>
                  </div>
                  <label className="toggle" aria-label={t.settings.labelWidgetAlwaysOnTop}>
                    <input
                      id={widgetAlwaysOnTopId}
                      type="checkbox"
                      checked={widgetAlwaysOnTop}
                      onChange={handleWidgetAlwaysOnTopToggle}
                      disabled={loadingGeneral}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            )}

            {section === 'backup' && (
              <div className="settings-pane">
                <p className="settings-pane-description">{t.settings.backupDesc}</p>

                {backupResult && (
                  <p className={`settings-backup-result${backupResult.ok ? '' : ' settings-backup-result--error'}`}>
                    {backupResult.msg}
                  </p>
                )}

                <div className="settings-field">
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => void handleExport()}>
                    {t.settings.exportTasks}
                  </button>
                </div>

                <div className="settings-divider" />

                <p className="settings-section-label">{t.settings.importHeader}</p>
                <p className="settings-section-sublabel">{t.settings.importDesc}</p>

                <div className="settings-field">
                  <div className="settings-backup-import-row">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => void handleImport(false)}
                    >
                      {t.settings.importAppend}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setImportConfirmReplace(true)}
                    >
                      {t.settings.importReplace}
                    </button>
                  </div>

                  {importConfirmReplace && (
                    <div className="settings-confirm-reset">
                      <p className="settings-confirm-text">{t.settings.importConfirmReplace}</p>
                      <div className="settings-confirm-buttons">
                        <button className="btn btn-danger btn-sm" onClick={() => void handleImport(true)}>
                          {t.settings.confirmYes}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setImportConfirmReplace(false)}>
                          {t.settings.cancel}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {section === 'updates' && (
              <div className="settings-pane">
                <p className="settings-pane-description">{t.settings.updatesDesc}</p>

                <div className="settings-row">
                  <div className="settings-row-text">
                    <span className="settings-row-label">{t.settings.labelVersion}</span>
                  </div>
                  <span className="settings-version-badge">{appVersion || '…'}</span>
                </div>

                <div className="settings-divider" />

                <UpdateStatusDisplay state={updaterState} t={t.settings} />

                <div className="settings-field">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => window.updaterAPI.checkForUpdates()}
                    disabled={updaterState.status === 'checking' || updaterState.status === 'downloading'}
                  >
                    {updaterState.status === 'checking' ? t.settings.checking : t.settings.checkForUpdates}
                  </button>

                  {updaterState.status === 'ready' && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: '8px' }}
                      onClick={() => window.updaterAPI.installUpdate()}
                    >
                      {t.settings.installUpdate}
                    </button>
                  )}
                </div>
              </div>
            )}

            {section === 'tips' && (
              <div className="settings-pane">
                <p className="settings-pane-description">{t.settings.tipsDesc}</p>

                <div className="tips-group-title">{t.settings.tipsGroupTaskList}</div>
                <div className="tips-table">
                  <div className="tips-row">
                    <kbd>Enter</kbd>
                    <span>{t.settings.tipsEnterTask}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>Escape</kbd>
                    <span>{t.settings.tipsEscape}</span>
                  </div>
                </div>

                <div className="tips-group-title">{t.settings.tipsGroupTaskForm}</div>
                <div className="tips-table">
                  <div className="tips-row">
                    <kbd>Enter</kbd>
                    <span>{t.settings.tipsEnterTag}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>,</kbd>
                    <span>{t.settings.tipsCommaTag}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>Backspace</kbd>
                    <span>{t.settings.tipsBackspaceTag}</span>
                  </div>
                </div>

                <div className="tips-group-title">{t.settings.tipsGroupApp}</div>
                <div className="tips-table">
                  <div className="tips-row">
                    <kbd>Ctrl</kbd><span className="tips-key-sep">+</span><kbd>Alt</kbd><span className="tips-key-sep">+</span><kbd>T</kbd>
                    <span>{t.settings.tipsAddTask}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>N</kbd>
                    <span>{t.settings.tipsQuickAdd}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>Ctrl</kbd><span className="tips-key-sep">+</span><kbd>F</kbd>
                    <span>{t.settings.tipsSearch}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>1</kbd><span className="tips-key-sep">/</span><kbd>2</kbd><span className="tips-key-sep">/</span><kbd>3</kbd>
                    <span>{t.settings.tipsSwitchViews}</span>
                  </div>
                  <div className="tips-row">
                    <kbd>Alt</kbd><span className="tips-key-sep">+</span><kbd>F4</kbd>
                    <span>{t.settings.tipsQuit}</span>
                  </div>
                </div>

                <div className="tips-group-title">{t.settings.tipsGroupTaskDrag}</div>
                <div className="tips-table">
                  <div className="tips-row">
                    <span className="tips-drag-hint">⠿ drag</span>
                    <span>{t.settings.tipsDragReorder}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


interface UpdateStatusProps {
  state: UpdateState
  t: {
    updateAvailable: (v: string) => string
    updateNotAvailable: string
    downloading: string
    updateReady: string
    updateErrorDev: string
    updateError: string
  }
}

function UpdateStatusDisplay({ state, t }: UpdateStatusProps): React.JSX.Element | null {
  if (state.status === 'idle' || state.status === 'checking') return null

  let text = ''
  let cls = 'settings-update-status'

  switch (state.status) {
    case 'available':
      text = t.updateAvailable(state.detail ?? '')
      cls += ' settings-update-status--available'
      break
    case 'not-available':
      text = t.updateNotAvailable
      cls += ' settings-update-status--ok'
      break
    case 'downloading':
      text = t.downloading
      break
    case 'ready':
      text = t.updateReady
      cls += ' settings-update-status--available'
      break
    case 'error':
      text = state.detail === 'dev-mode' ? t.updateErrorDev : `${t.updateError}${state.detail ? ` (${state.detail})` : ''}`
      cls += ' settings-update-status--error'
      break
  }

  return <p className={cls}>{text}</p>
}
