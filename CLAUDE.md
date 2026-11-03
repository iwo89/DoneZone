# DoneZone — Claude Code context

Electron 31 + React 18 + TypeScript + Vite + better-sqlite3 Windows task manager. No tests. No comments in source code (project convention) — document architecture here instead.

## Commands
- `npm run dev` — tsc watch + vite + electron (dev data in `.dev-data/`, prod data in `%APPDATA%/DoneZone`)
- `npm run compile` — build renderer (vite → dist/renderer) + main (tsc → dist/main)
- `npx electron-builder --win portable` — local test exe (`dist/DoneZone <ver>.exe`)
- `npm run publish` — build + GitHub release to `iwo89/DoneZone (old feed: miwa-OL/DZ-released, kept in sync for 1.5.x → 1.6 hop)` (needs `GH_TOKEN` env). Auto-updater feed = latest published (non-draft) release.

## Architecture
- `src/main/` — main process: `index.ts` (window/tray/global shortcut Ctrl+Alt+T), `ipc.ts` (ALL ipcMain.handle handlers; validate+cap every renderer input here), `preload.ts` (contextBridge APIs), `store.ts` (electron-store settings), `updater.ts` (electron-updater, silent), `notifications.ts`
- `src/db/database.ts` — better-sqlite3, WAL. Tables: `tasks`, `timer_tasks`. Idempotent migrations via try/catch ALTER.
- `src/types/*.ts` — shared types per domain (`task`, `timer`, `settings`, `updater`, `backup`, `window`). Each exposes an `XxxAPI` interface implemented in preload, declared on `Window` in `src/renderer/electron.d.ts`.
- `src/renderer/` — `App.tsx` (all state + view routing), `i18n.ts` (EN + PL — every UI string must exist in interface AND both languages), `ThemeContext` (`xp` default | `flat` | `dark` | `peachy` via `[data-theme]` CSS overrides in App.css), `LanguageContext`, `App.css` (single stylesheet, design tokens in `:root`)
- Views: `'todo' | 'done' | 'timer'` (TopNav switches; widget mode = compact always-on-top window, todo only)

## Time Tracker (v1.5)
- Table `timer_tasks`: `title, tag (single text), comments, accumulated_seconds, started_at (ISO | null = stopped), linked_task_id (→ tasks.id, no FK constraint), status ('todo'|'done'), completed_at, created_at`
- Timing model: running = `started_at != null`; display seconds = `accumulated + (now - started_at)`. Stop folds elapsed into `accumulated_seconds` (`stopTimer` in database.ts). Survives restarts (keeps running while app closed).
- IPC: `timer:getAll/create/update/delete/start/stop/markDone`; only title/tag/comments updatable. `markTimerDone` stops first, then sets status/completed_at.
- Renderer: `TimeTracker.tsx` (list: name | tag | time | done/delete; click row → detail; shows only status='todo'), `TimerDetailModal.tsx` (big timer + Start/Stop [hidden when done] + read-only info + Edit), `TimerTaskModal.tsx` (add/edit form), `TimerText.tsx` (self-ticking 1s display, reused everywhere), `timeUtils.ts` (`formatHMS`, `elapsedSeconds`)
- Done timer tasks render in the Done view: TaskList takes `doneTimers`/`onDeleteTimer` and appends `task-card--timer` cards (title, Timer badge, tag, total time) after regular done tasks
- To Do link: clock button on todo TaskCard → `handleTrackTime` in App.tsx copies task (title, first tag, description→comments) into a timer task with `linked_task_id`, then jumps to its detail. Linked todo cards show a live `timer-chip` (click = jump). One timer task per todo task (existing link → jump instead of create). Timer tasks are independent copies otherwise; deleting either side never touches the other. Only active (status='todo') timers appear as chips.
- Widget mode: `widgetView` state in App + `widget-tabs` toggle (To Do | Timer) in WidgetBar upper-left; tracker collapses to name+time columns via `.app--widget` CSS; modals shrink via `.app--widget .modal`
- Timer UX: "Track time" auto-starts the created timer; tracker rows have inline Start/Stop; `TimerTotals` (in TimeTracker.tsx) shows ticking grand total + top-5 per-tag sums; running timer shows as green `titlebar-timer` chip (click = jump to detail); `formatHMS` rolls into `Nd HH:MM:SS` past 24h
- Stale-timer banner: on mount App collects running timers into `staleTimers` and shows a banner (keep / stop&keep / `timer:discardRun` which nulls started_at without accumulating)

## Persistence quirks
- Filter bar (priority/tag/sort) persists to `localStorage['donezone-filters']` — loaded in TaskList state initializers, saved on change, validated against known values. Tag filter only auto-clears once tasks are loaded (`tasks.length > 0` guard).
- Backup JSON v2 = `{ version, exported_at, app, tasks[], timer_tasks[] }` (ids stripped). `importBackup` (database.ts) validates/caps every field, imports timers stopped with `linked_task_id = NULL`, and runs replace-delete + inserts in ONE transaction. v1 backups (no `timer_tasks`) still import.
- Deleting a task nulls `linked_task_id` on its timer (no dangling links). `startTimer` refuses `status='done'` rows.

## Hardening (don't regress)
- Single instance: `app.requestSingleInstanceLock()` in index.ts; `second-instance` → `showWindow()`
- No sourcemaps in prod: vite `sourcemap: false` + `!**/*.map` in build.files
- `openTimerDetail`/`handleOpenTimerFromTodo`/`handleTrackTime` are useCallback — keep them stable or TaskCard's React.memo breaks

## UX invariants
- Keyboard: `N` = new task (timer task in tracker view), `1/2/3` = switch views — guarded against typing in inputs and open modals (keydown effect in App.tsx); documented in Settings → Tips
- All 4 modals use `useFocusTrap` (src/renderer/useFocusTrap.ts): Tab cycles inside, focus returns to opener on close
- `.list-sticky` keeps list header + filter bar (+ timer totals) pinned during scroll
- Export/import distinguish dialog-cancel (silent) from failure/0-imports (message); all confirms auto-dismiss after 5s
- First-run: To Do empty state shows onboarding card (add task / widget) with Open Settings button — main window only

- Search: TopNav search button toggles, Ctrl+F opens `SearchBar` (state in App.tsx, passed as `search: SearchState` to TaskList + TimeTracker; main window only). `matchesSearch` (searchUtils.ts) = case-insensitive substring over title/description/tags (timers: title/tag/comments). Searching disables manual drag-reorder.

## Conventions
- Renderer never imports Node/Electron — only `window.*API` bridges
- Every IPC input: type-check + trim + length-cap in ipc.ts (title 500, description/comments 5000, tag 50, keys 500)
- Modals: overlay + `closing` prop animation (`CLOSE_DURATION` 200ms timers in App.tsx)
- New settings: store.ts defaults → ipc.ts get/set → preload → types/settings.ts → SettingsPanel row with `<Tip>` tooltip → i18n (incl. `tip*` string)
- Release: bump package.json version, commit, push, `npm run publish` (publish.releaseType "release" → goes live without a draft step)
