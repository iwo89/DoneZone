import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense, lazy } from 'react'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import type { TimerTask } from '../types/timer'
import { useT } from './LanguageContext'
import TitleBar from './components/TitleBar'
import WidgetBar from './components/WidgetBar'
import TopNav from './components/TopNav'
import TaskList from './components/TaskList'
import TimeTracker from './components/TimeTracker'
import ErrorBoundary from './components/ErrorBoundary'
import { formatHMS, elapsedSeconds } from './timeUtils'
import './App.css'

const TaskModal    = lazy(() => import('./components/TaskModal'))
const SettingsPanel = lazy(() => import('./components/SettingsPanel'))
const ConfettiBurst = lazy(() => import('./components/ConfettiBurst'))
const SplashScreen  = lazy(() => import('./components/SplashScreen'))
const TimerTaskModal   = lazy(() => import('./components/TimerTaskModal'))
const TimerDetailModal = lazy(() => import('./components/TimerDetailModal'))

type View = 'todo' | 'done' | 'timer'
type ModalState = { mode: 'add' } | { mode: 'edit'; task: Task } | null
type TimerModalState = { mode: 'add' } | { mode: 'edit'; task: TimerTask } | null

const CLOSE_DURATION = 200

function computeTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function App(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('todo')
  const [modal, setModal] = useState<ModalState>(null)
  const [modalClosing, setModalClosing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsClosing, setSettingsClosing] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isWidgetMode, setIsWidgetMode] = useState(false)
  const [todayStr, setTodayStr] = useState(computeTodayStr)
  const [timerTasks, setTimerTasks] = useState<TimerTask[]>([])
  const [timerModal, setTimerModal] = useState<TimerModalState>(null)
  const [timerModalClosing, setTimerModalClosing] = useState(false)
  const [timerDetailId, setTimerDetailId] = useState<number | null>(null)
  const [timerDetailClosing, setTimerDetailClosing] = useState(false)
  const [widgetView, setWidgetView] = useState<'todo' | 'timer'>('todo')
  const [staleTimers, setStaleTimers] = useState<TimerTask[]>([])
  const closeModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeSettingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerDetailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useT()
  const [updateBanner, setUpdateBanner] = useState<{ version: string; dismissed: boolean; isReady: boolean }>({ version: '', dismissed: false, isReady: false })

  const refresh = useCallback(async () => {
    setTasks(await window.taskAPI.getAll())
  }, [])

  const refreshTimers = useCallback(async () => {
    setTimerTasks(await window.timerAPI.getAll())
  }, [])

  useEffect(() => {
    void refresh()
    void refreshTimers()
    void window.timerAPI.getAll().then((all) => {
      setStaleTimers(all.filter((tt) => tt.started_at !== null && tt.status !== 'done'))
    })
  }, [refresh, refreshTimers])

  useEffect(() => {
    return window.windowAPI.onWidgetModeChange(setIsWidgetMode)
  }, [])

  useEffect(() => {
    return window.windowAPI.onOpenAddTask(() => setModal({ mode: 'add' }))
  }, [])

  useEffect(() => {
    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timer = setTimeout(() => setTodayStr(computeTodayStr()), msUntilMidnight)
    return () => clearTimeout(timer)
  }, [todayStr])

  useEffect(() => {
    return () => {
      if (closeModalTimer.current !== null) clearTimeout(closeModalTimer.current)
      if (closeSettingsTimer.current !== null) clearTimeout(closeSettingsTimer.current)
      if (closeTimerModalTimer.current !== null) clearTimeout(closeTimerModalTimer.current)
      if (closeTimerDetailTimer.current !== null) clearTimeout(closeTimerDetailTimer.current)
    }
  }, [])

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [])

  const toggleSearch = useCallback(() => {
    if (searchOpen) closeSearch()
    else setSearchOpen(true)
  }, [searchOpen, closeSearch])

  useEffect(() => {
    function onFind(e: KeyboardEvent): void {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'f') return
      if (isWidgetMode || modal !== null || timerModal !== null || timerDetailId !== null || showSettings) return
      e.preventDefault()
      setSearchOpen(true)
    }
    window.addEventListener('keydown', onFind)
    return () => window.removeEventListener('keydown', onFind)
  }, [isWidgetMode, modal, timerModal, timerDetailId, showSettings])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) return
      if (modal !== null || timerModal !== null || timerDetailId !== null || showSettings) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        if ((isWidgetMode ? widgetView : view) === 'timer') setTimerModal({ mode: 'add' })
        else setModal({ mode: 'add' })
      } else if (!isWidgetMode && (e.key === '1' || e.key === '2' || e.key === '3')) {
        setView(e.key === '1' ? 'todo' : e.key === '2' ? 'done' : 'timer')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, timerModal, timerDetailId, showSettings, isWidgetMode, widgetView, view])

  useEffect(() => {
    return window.updaterAPI.onStatusChange((state) => {
      if (state.status === 'available') {
        setUpdateBanner({ version: state.detail ?? '', dismissed: false, isReady: false })
      } else if (state.status === 'ready') {
        setUpdateBanner((b) => ({ ...b, version: state.detail ?? b.version, dismissed: false, isReady: true }))
      }
    })
  }, [])

  function closeModal(): void {
    if (closeModalTimer.current !== null) clearTimeout(closeModalTimer.current)
    setModalClosing(true)
    closeModalTimer.current = setTimeout(() => {
      setModal(null)
      setModalClosing(false)
      closeModalTimer.current = null
    }, CLOSE_DURATION)
  }

  function closeSettings(): void {
    if (closeSettingsTimer.current !== null) clearTimeout(closeSettingsTimer.current)
    setSettingsClosing(true)
    closeSettingsTimer.current = setTimeout(() => {
      setShowSettings(false)
      setSettingsClosing(false)
      closeSettingsTimer.current = null
    }, CLOSE_DURATION)
  }

  async function handleCreate(input: CreateTaskInput): Promise<void> {
    await window.taskAPI.create(input)
    await refresh()
    closeModal()
  }

  async function handleUpdate(id: number, updates: UpdateTaskInput): Promise<void> {
    await window.taskAPI.update(id, updates)
    await refresh()
    closeModal()
  }

  async function handleDelete(id: number): Promise<void> {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    await window.taskAPI.delete(id)
    await refresh()
  }

  async function handleMarkDone(id: number): Promise<void> {
    setConfettiActive(true)
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'done' as const } : t))
    await window.taskAPI.markDone(id)
    await refresh()
  }

  const handleConfettiDone = useCallback(() => setConfettiActive(false), [])
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  function enterWidgetMode(): void { void window.windowAPI.enterWidget() }
  function exitWidgetMode(): void  { void window.windowAPI.exitWidget() }

  async function handleReorder(ids: number[]): Promise<void> {
    try {
      await window.taskAPI.reorder(ids)
      await refresh()
    } catch (err) {
      console.error('[App] reorder failed:', err)
      await refresh()
    }
  }

  function closeTimerModal(): void {
    if (closeTimerModalTimer.current !== null) clearTimeout(closeTimerModalTimer.current)
    setTimerModalClosing(true)
    closeTimerModalTimer.current = setTimeout(() => {
      setTimerModal(null)
      setTimerModalClosing(false)
      closeTimerModalTimer.current = null
    }, CLOSE_DURATION)
  }

  function closeTimerDetail(): void {
    if (closeTimerDetailTimer.current !== null) clearTimeout(closeTimerDetailTimer.current)
    setTimerDetailClosing(true)
    closeTimerDetailTimer.current = setTimeout(() => {
      setTimerDetailId(null)
      setTimerDetailClosing(false)
      closeTimerDetailTimer.current = null
    }, CLOSE_DURATION)
  }

  async function handleTimerSave(data: { title: string; tag: string | null; comments: string | null }): Promise<void> {
    if (timerModal?.mode === 'edit') {
      await window.timerAPI.update(timerModal.task.id, data)
    } else {
      await window.timerAPI.create(data)
    }
    await refreshTimers()
    closeTimerModal()
  }

  async function handleTimerDelete(id: number): Promise<void> {
    setTimerTasks((prev) => prev.filter((t) => t.id !== id))
    if (timerDetailId === id) closeTimerDetail()
    await window.timerAPI.delete(id)
    await refreshTimers()
  }

  async function handleTimerStart(id: number): Promise<void> {
    await window.timerAPI.start(id)
    await refreshTimers()
  }

  async function handleTimerStop(id: number): Promise<void> {
    await window.timerAPI.stop(id)
    await refreshTimers()
  }

  async function handleTimerMarkDone(id: number): Promise<void> {
    setConfettiActive(true)
    if (timerDetailId === id) closeTimerDetail()
    await window.timerAPI.markDone(id)
    await refreshTimers()
  }

  const openTimerDetail = useCallback((timerId: number): void => {
    if (closeTimerDetailTimer.current !== null) clearTimeout(closeTimerDetailTimer.current)
    setTimerDetailClosing(false)
    setTimerDetailId(timerId)
  }, [])

  const handleOpenTimerFromTodo = useCallback((timerId: number): void => {
    setView('timer')
    openTimerDetail(timerId)
  }, [openTimerDetail])

  const handleTrackTime = useCallback(async (taskId: number): Promise<void> => {
    const jump = (timerId: number): void => {
      if (isWidgetMode) setWidgetView('timer')
      else setView('timer')
      openTimerDetail(timerId)
    }
    const existing = timerTasks.find((tt) => tt.linked_task_id === taskId && tt.status !== 'done')
    if (existing) {
      jump(existing.id)
      return
    }
    const task = tasks.find((tk) => tk.id === taskId)
    if (!task) return
    const created = await window.timerAPI.create({
      title: task.title,
      tag: task.tags?.[0] ?? null,
      comments: task.description,
      linked_task_id: task.id,
    })
    await window.timerAPI.start(created.id)
    await refreshTimers()
    jump(created.id)
  }, [timerTasks, tasks, isWidgetMode, openTimerDetail, refreshTimers])

  const popStale = useCallback((): void => setStaleTimers((prev) => prev.slice(1)), [])

  async function handleStaleStop(): Promise<void> {
    const s = staleTimers[0]
    if (!s) return
    await window.timerAPI.stop(s.id)
    await refreshTimers()
    popStale()
  }

  async function handleStaleDiscard(): Promise<void> {
    const s = staleTimers[0]
    if (!s) return
    await window.timerAPI.discardRun(s.id)
    await refreshTimers()
    popStale()
  }


  const visibleTasks = useMemo(() => tasks.filter((t) => t.status === view), [tasks, view])
  const todoTasks    = useMemo(() => tasks.filter((t) => t.status === 'todo'), [tasks])
  const activeTimerTasks = useMemo(() => timerTasks.filter((tt) => tt.status !== 'done'), [timerTasks])
  const doneTimerTasks = useMemo(
    () => timerTasks
      .filter((tt) => tt.status === 'done')
      .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? '')),
    [timerTasks],
  )
  const timersByTaskId = useMemo(() => {
    const map = new Map<number, TimerTask>()
    for (const tt of activeTimerTasks) {
      if (tt.linked_task_id !== null) map.set(tt.linked_task_id, tt)
    }
    return map
  }, [activeTimerTasks])
  const timerDetailTask = useMemo(
    () => (timerDetailId !== null ? timerTasks.find((tt) => tt.id === timerDetailId) ?? null : null),
    [timerDetailId, timerTasks],
  )
  const runningTimer = useMemo(
    () => activeTimerTasks.find((tt) => tt.started_at !== null) ?? null,
    [activeTimerTasks],
  )
  const todoCount    = todoTasks.length
  const urgentCount  = useMemo(
    () => todoTasks.filter((t) => t.due_date !== null && t.due_date <= todayStr).length,
    [todoTasks, todayStr],
  )

  const searchState = useMemo(
    () => (isWidgetMode ? undefined : { open: searchOpen, query: searchQuery, onChange: setSearchQuery, onClose: closeSearch }),
    [isWidgetMode, searchOpen, searchQuery, closeSearch],
  )

  return (
    <ErrorBoundary>
    <div className={`app${isWidgetMode ? ' app--widget' : ''}`}>
      {isWidgetMode
        ? <WidgetBar onExit={exitWidgetMode} view={widgetView} onViewChange={setWidgetView} />
        : <TitleBar
            runningTimer={runningTimer}
            onTimerClick={runningTimer ? () => handleOpenTimerFromTodo(runningTimer.id) : undefined}
          />
      }

      {staleTimers.length > 0 && !isWidgetMode && (
        <div className="stale-banner">
          <span className="stale-banner-text">
            {t.timer.staleBanner(
              staleTimers[0].title,
              formatHMS(elapsedSeconds(staleTimers[0].accumulated_seconds, staleTimers[0].started_at)),
            )}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={popStale}>
            {t.timer.staleKeep}
          </button>
          <button className="btn btn-success btn-sm" onClick={() => void handleStaleStop()}>
            {t.timer.staleStop}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => void handleStaleDiscard()}>
            {t.timer.staleDiscard}
          </button>
        </div>
      )}

      {updateBanner.version !== '' && !updateBanner.dismissed && (
        <div className="update-banner">
          <span className="update-banner-text">
            {updateBanner.isReady
              ? t.settings.updateBannerReady(updateBanner.version)
              : t.settings.updateBannerAvailable(updateBanner.version)}
          </span>
          <button
            className="update-banner-install"
            onClick={() => window.updaterAPI.installUpdate()}
            disabled={!updateBanner.isReady}
          >
            {t.settings.installUpdate}
          </button>
          <button className="update-banner-dismiss" onClick={() => setUpdateBanner((b) => ({ ...b, dismissed: true }))}>
            {t.settings.updateBannerLater}
          </button>
        </div>
      )}

      <div className="app-main">
      {!isWidgetMode && (
        <TopNav
          view={view}
          onViewChange={setView}
          todoCount={todoCount}
          urgentCount={urgentCount}
          onSettingsClick={() => setShowSettings(true)}
          onWidgetClick={enterWidgetMode}
          onSearchClick={toggleSearch}
          searchActive={searchOpen}
        />
      )}

      <div className="app-body">
        <main className="main">
          {(isWidgetMode ? widgetView === 'timer' : view === 'timer') ? (
            <TimeTracker
              tasks={activeTimerTasks}
              onAdd={() => setTimerModal({ mode: 'add' })}
              onOpen={openTimerDetail}
              onDelete={(id) => void handleTimerDelete(id)}
              onMarkDone={(id) => void handleTimerMarkDone(id)}
              onStart={(id) => void handleTimerStart(id)}
              onStop={(id) => void handleTimerStop(id)}
              search={searchState}
            />
          ) : (
            <TaskList
              tasks={isWidgetMode ? todoTasks : visibleTasks}
              view={isWidgetMode || view === 'timer' ? 'todo' : view}
              onAdd={() => setModal({ mode: 'add' })}
              onEdit={(id) => {
                const task = tasks.find((t) => t.id === id)
                if (task) setModal({ mode: 'edit', task })
              }}
              onMarkDone={handleMarkDone}
              onDelete={handleDelete}
              onReorder={handleReorder}
              timers={timersByTaskId}
              onTrackTime={handleTrackTime}
              onOpenTimer={isWidgetMode ? openTimerDetail : handleOpenTimerFromTodo}
              doneTimers={!isWidgetMode && view === 'done' ? doneTimerTasks : undefined}
              onDeleteTimer={(id) => void handleTimerDelete(id)}
              onOpenSettings={isWidgetMode ? undefined : () => setShowSettings(true)}
              search={searchState}
            />
          )}
        </main>
      </div>
      </div>

      <Suspense fallback={null}>
        {modal !== null && (
          <TaskModal
            task={modal.mode === 'edit' ? modal.task : null}
            closing={modalClosing}
            onSave={
              modal.mode === 'add'
                ? handleCreate
                : (data: CreateTaskInput) => handleUpdate(modal.task.id, data)
            }
            onClose={closeModal}
          />
        )}

        {timerModal !== null && (
          <TimerTaskModal
            task={timerModal.mode === 'edit' ? timerModal.task : null}
            closing={timerModalClosing}
            onSave={handleTimerSave}
            onClose={closeTimerModal}
          />
        )}

        {timerDetailTask !== null && timerModal === null && (
          <TimerDetailModal
            task={timerDetailTask}
            closing={timerDetailClosing}
            onClose={closeTimerDetail}
            onEdit={() => setTimerModal({ mode: 'edit', task: timerDetailTask })}
            onStart={(id) => void handleTimerStart(id)}
            onStop={(id) => void handleTimerStop(id)}
          />
        )}

        {!isWidgetMode && showSettings && (
          <SettingsPanel closing={settingsClosing} onClose={closeSettings} />
        )}

        <ConfettiBurst active={confettiActive} onDone={handleConfettiDone} />

        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </Suspense>
    </div>
    </ErrorBoundary>
  )
}
