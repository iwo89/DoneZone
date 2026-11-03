import React, { useState, useEffect, useCallback } from 'react'
import type { AiProvider } from '../../types/fathom'

type SettingsSection = 'general' | 'fathom'

interface Props {
  onClose: () => void
}

interface FathomForm {
  userName: string
  watchFolder: string
  aiProvider: AiProvider
  geminiApiKey: string
  claudeApiKey: string
  hasGeminiKey: boolean
  hasClaudeKey: boolean
}

export default function SettingsPanel({ onClose }: Props): React.JSX.Element {
  const [section, setSection] = useState<SettingsSection>('general')

  const [openAtLogin, setOpenAtLogin] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loadingGeneral, setLoadingGeneral] = useState(true)

  const [fathom, setFathom] = useState<FathomForm>({
    userName: '',
    watchFolder: '',
    aiProvider: 'gemini',
    geminiApiKey: '',
    claudeApiKey: '',
    hasGeminiKey: false,
    hasClaudeKey: false,
  })
  const [watcherActive, setWatcherActive] = useState(false)
  const [loadingFathom, setLoadingFathom] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processResult, setProcessResult] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    Promise.all([
      window.settingsAPI.getOpenAtLogin(),
      window.settingsAPI.getNotificationsEnabled(),
    ]).then(([login, notifs]) => {
      setOpenAtLogin(login)
      setNotificationsEnabled(notifs)
    }).finally(() => setLoadingGeneral(false))

    Promise.all([
      window.fathomAPI.getConfig(),
      window.fathomAPI.isWatcherActive(),
    ]).then(([cfg, active]) => {
      setFathom((f) => ({
        ...f,
        userName: cfg.userName,
        watchFolder: cfg.watchFolder,
        aiProvider: cfg.aiProvider,
        hasGeminiKey: cfg.hasGeminiKey,
        hasClaudeKey: cfg.hasClaudeKey,
      }))
      setWatcherActive(active)
    }).finally(() => setLoadingFathom(false))
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

  function setFathomField<K extends keyof FathomForm>(key: K, val: FathomForm[K]): void {
    setFathom((f) => ({ ...f, [key]: val }))
    setProcessResult(null)
  }

  const refreshWatcherState = useCallback(async (): Promise<void> => {
    const [cfg, active] = await Promise.all([
      window.fathomAPI.getConfig(),
      window.fathomAPI.isWatcherActive(),
    ])
    setFathom((f) => ({
      ...f,
      hasGeminiKey: cfg.hasGeminiKey,
      hasClaudeKey: cfg.hasClaudeKey,
      geminiApiKey: '',
      claudeApiKey: '',
    }))
    setWatcherActive(active)
  }, [])

  const saveFathomField = useCallback(async (patch: Partial<FathomForm>): Promise<void> => {
    await window.fathomAPI.setConfig({
      userName:      patch.userName,
      watchFolder:   patch.watchFolder,
      aiProvider:    patch.aiProvider,
      geminiApiKey:  patch.geminiApiKey && patch.geminiApiKey.length > 0 ? patch.geminiApiKey : undefined,
      claudeApiKey:  patch.claudeApiKey && patch.claudeApiKey.length > 0 ? patch.claudeApiKey : undefined,
    })
    await refreshWatcherState()
  }, [refreshWatcherState])

  async function handleBrowse(): Promise<void> {
    const folder = await window.fathomAPI.browseFolder()
    if (folder) {
      setFathomField('watchFolder', folder)
      await saveFathomField({ watchFolder: folder })
    }
  }

  async function handleProviderChange(provider: AiProvider): Promise<void> {
    setFathomField('aiProvider', provider)
    await saveFathomField({ aiProvider: provider })
  }

  async function handleProcessNow(): Promise<void> {
    setProcessing(true)
    setProcessResult(null)
    try {
      const result = await window.fathomAPI.processNow()
      const active = await window.fathomAPI.isWatcherActive()
      setWatcherActive(active)
      if (result.error) {
        setProcessResult(`Error — ${result.error}`)
      } else if (result.processed === 0) {
        setProcessResult('No .txt or .md files found in the watch folder.')
      } else {
        setProcessResult(
          `Processed ${result.processed} file${result.processed !== 1 ? 's' : ''}, ` +
          `created ${result.created} task${result.created !== 1 ? 's' : ''}.`,
        )
      }
    } catch (err) {
      setProcessResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setProcessing(false)
    }
  }

  async function handleReset(): Promise<void> {
    await window.fathomAPI.resetConfig()
    setFathom({
      userName: '', watchFolder: '', aiProvider: 'gemini',
      geminiApiKey: '', claudeApiKey: '', hasGeminiKey: false, hasClaudeKey: false,
    })
    setWatcherActive(false)
    setProcessResult(null)
    setConfirmReset(false)
  }

  const toggleId = 'setting-open-at-login'
  const notifToggleId = 'setting-notifications'

  const activeKey = fathom.aiProvider === 'claude' ? fathom.hasClaudeKey : fathom.hasGeminiKey
  const activeKeyTyped = fathom.aiProvider === 'claude'
    ? fathom.claudeApiKey.length > 0
    : fathom.geminiApiKey.length > 0
  const canProcessNow = fathom.watchFolder.length > 0 && (activeKey || activeKeyTyped)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item${section === 'general' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('general')}
            >
              General
            </button>
            <button
              className={`settings-nav-item${section === 'fathom' ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection('fathom')}
            >
              Fathom Sync
            </button>
          </nav>

          <div className="settings-content">
            {section === 'general' && (
              <div className="settings-pane">
                <div className="settings-row">
                  <div className="settings-row-text">
                    <label className="settings-row-label" htmlFor={toggleId}>
                      Start automatically with Windows
                    </label>
                    <p className="settings-row-description">Launch DoneZone when you log in.</p>
                  </div>
                  <label className="toggle" aria-label="Start automatically with Windows">
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

                <div className="settings-row">
                  <div className="settings-row-text">
                    <label className="settings-row-label" htmlFor={notifToggleId}>
                      Enable notifications
                    </label>
                    <p className="settings-row-description">Show desktop alerts for new and due tasks.</p>
                  </div>
                  <label className="toggle" aria-label="Enable notifications">
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
              </div>
            )}

            {section === 'fathom' && (
              <div className="settings-pane">
                <p className="settings-pane-description">
                  Monitor a folder for Fathom meeting note files and extract action items
                  assigned to you using AI.
                </p>

                {loadingFathom ? (
                  <p className="settings-loading">Loading…</p>
                ) : (
                  <>
                    <div className="settings-field">
                      <label className="form-label" htmlFor="fathom-name">Your name</label>
                      <input
                        id="fathom-name"
                        className="form-input"
                        type="text"
                        placeholder="e.g. Alice Smith"
                        value={fathom.userName}
                        onChange={(e) => setFathomField('userName', e.target.value)}
                        onBlur={() => saveFathomField({ userName: fathom.userName })}
                      />
                      <span className="form-hint">Used to match tasks assigned to you in meeting notes.</span>
                    </div>

                    <div className="settings-field">
                      <label className="form-label" htmlFor="fathom-folder">Watch folder</label>
                      <div className="settings-path-row">
                        <input
                          id="fathom-folder"
                          className="form-input"
                          type="text"
                          placeholder="No folder selected"
                          value={fathom.watchFolder}
                          readOnly
                        />
                        <button className="btn btn-ghost btn-sm" onClick={handleBrowse}>
                          Browse
                        </button>
                      </div>
                    </div>

                    <div className="settings-divider" />

                    <div className="settings-field">
                      <span className="form-label">AI provider</span>
                      <div className="settings-provider-row">
                        <label className="settings-provider-option">
                          <input
                            type="radio"
                            name="ai-provider"
                            value="gemini"
                            checked={fathom.aiProvider === 'gemini'}
                            onChange={() => handleProviderChange('gemini')}
                          />
                          <span>Gemini</span>
                        </label>
                        <label className="settings-provider-option">
                          <input
                            type="radio"
                            name="ai-provider"
                            value="claude"
                            checked={fathom.aiProvider === 'claude'}
                            onChange={() => handleProviderChange('claude')}
                          />
                          <span>Claude</span>
                        </label>
                      </div>
                    </div>

                    {fathom.aiProvider === 'gemini' && (
                      <div className="settings-field">
                        <label className="form-label" htmlFor="fathom-gemini-key">Gemini API key</label>
                        <input
                          id="fathom-gemini-key"
                          className="form-input"
                          type="password"
                          placeholder={fathom.hasGeminiKey ? 'API key saved — type to replace' : 'Paste your Gemini API key'}
                          value={fathom.geminiApiKey}
                          onChange={(e) => setFathomField('geminiApiKey', e.target.value)}
                          onBlur={() => {
                            if (fathom.geminiApiKey.length > 0) {
                              void saveFathomField({ geminiApiKey: fathom.geminiApiKey })
                            }
                          }}
                          autoComplete="off"
                        />
                        {fathom.hasGeminiKey && fathom.geminiApiKey.length === 0 && (
                          <span className="settings-key-saved">✓ Key saved</span>
                        )}
                      </div>
                    )}

                    {fathom.aiProvider === 'claude' && (
                      <div className="settings-field">
                        <label className="form-label" htmlFor="fathom-claude-key">Claude API key</label>
                        <input
                          id="fathom-claude-key"
                          className="form-input"
                          type="password"
                          placeholder={fathom.hasClaudeKey ? 'API key saved — type to replace' : 'Paste your Claude API key'}
                          value={fathom.claudeApiKey}
                          onChange={(e) => setFathomField('claudeApiKey', e.target.value)}
                          onBlur={() => {
                            if (fathom.claudeApiKey.length > 0) {
                              void saveFathomField({ claudeApiKey: fathom.claudeApiKey })
                            }
                          }}
                          autoComplete="off"
                        />
                        {fathom.hasClaudeKey && fathom.claudeApiKey.length === 0 && (
                          <span className="settings-key-saved">✓ Key saved</span>
                        )}
                      </div>
                    )}

                    <div className="settings-divider" />

                    <div className="settings-watcher-status">
                      <span className="settings-row-description">
                        {fathom.watchFolder ? fathom.watchFolder : 'No folder configured'}
                      </span>
                      <span className={`settings-status-badge ${watcherActive ? 'settings-status-badge--active' : 'settings-status-badge--inactive'}`}>
                        {watcherActive ? 'Watching' : 'Inactive'}
                      </span>
                    </div>

                    <div className="settings-field">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleProcessNow}
                        disabled={processing || !canProcessNow}
                      >
                        {processing ? 'Processing…' : 'Process Now'}
                      </button>
                      {processResult && (
                        <p className={`settings-process-result ${processResult.startsWith('Error') ? 'settings-process-result--error' : ''}`}>
                          {processResult}
                        </p>
                      )}
                    </div>

                    <div className="settings-divider" />

                    <div className="settings-field">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmReset(true)}
                        disabled={processing}
                      >
                        Reset config data
                      </button>

                      {confirmReset && (
                        <div className="settings-confirm-reset">
                          <p className="settings-confirm-text">
                            Clear your name, API keys, and watch folder? This cannot be undone.
                          </p>
                          <div className="settings-confirm-buttons">
                            <button className="btn btn-danger btn-sm" onClick={handleReset}>
                              Yes, reset
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
