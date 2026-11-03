import chokidar, { FSWatcher } from 'chokidar'
import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import { Notification } from 'electron'
import { createTask, taskExistsByTitle } from '../db/database'
import store from './store'
import type { ProcessResult } from '../types/fathom'

let watcher: FSWatcher | null = null
let onTasksCreated: (() => void) | null = null

export function setOnTasksCreated(fn: () => void): void {
  onTasksCreated = fn
}

export function isWatcherActive(): boolean {
  return watcher !== null
}

function notify(title: string, body: string): void {
  if (!Notification.isSupported()) return
  new Notification({ title, body }).show()
}

// ── Gemini ────────────────────────────────────────────────────────────────────

let cachedGenAI: { key: string; instance: GoogleGenerativeAI } | null = null

function getGenAI(apiKey: string): GoogleGenerativeAI {
  if (cachedGenAI?.key !== apiKey) {
    cachedGenAI = { key: apiKey, instance: new GoogleGenerativeAI(apiKey) }
  }
  return cachedGenAI.instance
}

function stripJsonFences(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('503') || msg.includes('Service Unavailable') ||
         msg.includes('429') || msg.includes('Too Many Requests')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildPrompt(fileContents: string, userName: string): string {
  const firstName = userName.split(' ')[0]
  const nameClause = firstName !== userName
    ? `"${userName}" or "${firstName}"`
    : `"${userName}"`

  return (
    `You are extracting action items from meeting notes.\n` +
    `Find every task, action item, or next step that belongs to the person named ${nameClause}.\n` +
    `Look in ALL sections: "Action Items", "Next Steps", "Follow-ups", and anywhere a name precedes a task (e.g. "Marcin: Do something").\n` +
    `Include passive items like "await", "monitor", "review", "check" — anything the person needs to do or track.\n` +
    `Return ONLY a valid JSON array of strings, one string per task, written as an imperative sentence.\n` +
    `Do not include tasks owned by other people. If no tasks are found, return [].\n\n` +
    fileContents
  )
}

function parseTaskArray(raw: string): string[] {
  const parsed: unknown = JSON.parse(stripJsonFences(raw))
  if (!Array.isArray(parsed)) return []
  return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

async function extractWithGemini(fileContents: string, userName: string, apiKey: string): Promise<string[]> {
  const model = getGenAI(apiKey).getGenerativeModel({ model: 'gemini-2.5-flash' })
  const prompt = buildPrompt(fileContents, userName)

  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return parseTaskArray(result.response.text())
    } catch (err) {
      lastErr = err
      if (!isRetryable(err) || attempt === 2) break
      const delayMs = (attempt + 1) * 15_000
      console.warn(`[Fathom] Gemini attempt ${attempt + 1} failed, retrying in ${delayMs / 1000}s…`, err)
      await sleep(delayMs)
    }
  }
  throw lastErr
}

// ── Claude ────────────────────────────────────────────────────────────────────

let cachedClaude: { key: string; instance: Anthropic } | null = null

function getClaude(apiKey: string): Anthropic {
  if (cachedClaude?.key !== apiKey) {
    cachedClaude = { key: apiKey, instance: new Anthropic({ apiKey }) }
  }
  return cachedClaude.instance
}

async function extractWithClaude(fileContents: string, userName: string, apiKey: string): Promise<string[]> {
  const client = getClaude(apiKey)
  const prompt = buildPrompt(fileContents, userName)

  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })
      const block = message.content.find((b) => b.type === 'text')
      if (!block || block.type !== 'text') return []
      return parseTaskArray(block.text)
    } catch (err) {
      lastErr = err
      if (!isRetryable(err) || attempt === 2) break
      const delayMs = (attempt + 1) * 15_000
      console.warn(`[Fathom] Claude attempt ${attempt + 1} failed, retrying in ${delayMs / 1000}s…`, err)
      await sleep(delayMs)
    }
  }
  throw lastErr
}

async function extractTasks(fileContents: string, userName: string): Promise<string[]> {
  const provider = store.get('aiProvider')

  if (provider === 'claude') {
    const apiKey = store.get('claudeApiKey')
    if (!apiKey) throw new Error('Claude API key is not configured.')
    return extractWithClaude(fileContents, userName, apiKey)
  }

  const apiKey = store.get('geminiApiKey')
  if (!apiKey) throw new Error('Gemini API key is not configured.')
  return extractWithGemini(fileContents, userName, apiKey)
}

// ── File processing ───────────────────────────────────────────────────────────

async function getUniqueDest(destPath: string): Promise<string> {
  if (!fs.existsSync(destPath)) return destPath
  const ext = path.extname(destPath)
  const base = destPath.slice(0, -ext.length)
  let n = 1
  while (fs.existsSync(`${base}_${n}${ext}`)) n++
  return `${base}_${n}${ext}`
}

async function moveToProcessed(filePath: string, watchFolder: string): Promise<void> {
  const processedDir = path.join(watchFolder, 'processed')
  await fs.promises.mkdir(processedDir, { recursive: true })
  const dest = await getUniqueDest(path.join(processedDir, path.basename(filePath)))
  await fs.promises.rename(filePath, dest)
}

interface FileResult {
  created: number
  error?: string
}

async function processFile(filePath: string): Promise<FileResult> {
  const userName = store.get('userName')
  const watchFolder = store.get('watchFolder')

  if (!userName || !watchFolder) {
    return { created: 0, error: 'Missing configuration (name or watch folder).' }
  }

  const contents = await fs.promises.readFile(filePath, 'utf-8')
  if (!contents.trim()) {
    await moveToProcessed(filePath, watchFolder)
    return { created: 0 }
  }

  let taskTitles: string[]
  try {
    taskTitles = await extractTasks(contents, userName)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Fathom] Extraction failed for', filePath, err)
    return { created: 0, error: `AI error: ${msg}` }
  }

  let created = 0
  for (const title of taskTitles) {
    if (taskExistsByTitle(title)) continue
    createTask({ title, source: 'fathom', priority: 'normal', status: 'todo' })
    notify('New task from Fathom', title)
    created++
  }

  await moveToProcessed(filePath, watchFolder)

  if (created > 0) {
    onTasksCreated?.()
  }

  return { created }
}

// ── Watcher lifecycle ─────────────────────────────────────────────────────────

function hasRequiredConfig(): boolean {
  const provider = store.get('aiProvider')
  const userName = store.get('userName')
  const watchFolder = store.get('watchFolder')
  const apiKey = provider === 'claude' ? store.get('claudeApiKey') : store.get('geminiApiKey')
  return !!(userName && watchFolder && apiKey)
}

export function startWatcher(): void {
  if (!hasRequiredConfig()) return
  if (watcher !== null) return

  const folderPath = store.get('watchFolder')

  watcher = chokidar.watch(folderPath, {
    ignoreInitial: true,
    persistent: true,
    ignored: /[\\/]processed[\\/]/,
  })

  watcher.on('add', async (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase()
    if (ext !== '.txt' && ext !== '.md') return
    await processFile(filePath)
  })

  watcher.on('error', (err: unknown) => {
    console.error('[Fathom] Watcher error:', err)
  })

  console.log('[Fathom] Watching', folderPath)
}

export async function stopWatcher(): Promise<void> {
  if (!watcher) return
  await watcher.close()
  watcher = null
  console.log('[Fathom] Watcher stopped')
}

export async function restartWatcher(): Promise<void> {
  await stopWatcher()
  startWatcher()
}

export async function processFolder(): Promise<ProcessResult> {
  const folderPath = store.get('watchFolder')
  if (!folderPath) return { processed: 0, created: 0, error: 'No watch folder configured.' }

  let entries: string[]
  try {
    entries = await fs.promises.readdir(folderPath)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { processed: 0, created: 0, error: `Cannot read folder: ${msg}` }
  }

  const files = entries.filter((e) => {
    const ext = path.extname(e).toLowerCase()
    return ext === '.txt' || ext === '.md'
  })

  let totalCreated = 0
  const errors: string[] = []

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stat = await fs.promises.stat(filePath)
    if (!stat.isFile()) continue
    const result = await processFile(filePath)
    totalCreated += result.created
    if (result.error) errors.push(`${file}: ${result.error}`)
  }

  return {
    processed: files.length,
    created: totalCreated,
    error: errors.length > 0 ? errors.join('\n') : undefined,
  }
}
