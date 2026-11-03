import React, { useState, useEffect, useCallback } from 'react'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import TitleBar from './components/TitleBar'
import TopNav from './components/TopNav'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import SettingsPanel from './components/SettingsPanel'
import './App.css'

type View = 'todo' | 'done'
type ModalState = { mode: 'add' } | { mode: 'edit'; task: Task } | null

export default function App(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('todo')
  const [modal, setModal] = useState<ModalState>(null)
  const [showSettings, setShowSettings] = useState(false)

  const refresh = useCallback(async () => {
    setTasks(await window.taskAPI.getAll())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    window.fathomAPI.onTasksCreated(() => void refresh())
  }, [refresh])

  async function handleCreate(input: CreateTaskInput): Promise<void> {
    await window.taskAPI.create(input)
    await refresh()
    setModal(null)
  }

  async function handleUpdate(id: number, updates: UpdateTaskInput): Promise<void> {
    await window.taskAPI.update(id, updates)
    await refresh()
    setModal(null)
  }

  async function handleDelete(id: number): Promise<void> {
    await window.taskAPI.delete(id)
    await refresh()
  }

  async function handleMarkDone(id: number): Promise<void> {
    await window.taskAPI.markDone(id)
    await refresh()
  }

  const visibleTasks = tasks.filter((t) => t.status === view)
  const todoCount = tasks.filter((t) => t.status === 'todo').length

  return (
    <div className="app">
      <TitleBar />

      <TopNav
        view={view}
        onViewChange={setView}
        todoCount={todoCount}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="app-body">
        <main className="main">
          <TaskList
            tasks={visibleTasks}
            view={view}
            onAdd={() => setModal({ mode: 'add' })}
            onEdit={(task) => setModal({ mode: 'edit', task })}
            onMarkDone={handleMarkDone}
            onDelete={handleDelete}
          />
        </main>
      </div>

      {modal !== null && (
        <TaskModal
          task={modal.mode === 'edit' ? modal.task : null}
          onSave={
            modal.mode === 'add'
              ? handleCreate
              : (data: CreateTaskInput) => handleUpdate(modal.task.id, data)
          }
          onClose={() => setModal(null)}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
