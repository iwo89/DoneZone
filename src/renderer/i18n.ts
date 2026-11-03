export type Language = 'en' | 'pl'

export interface Translations {
  appName: string

  search: {
    placeholder: string
    close: string
  }

  titlebar: {
    minimize: string
    maximize: string
    restore: string
    close: string
  }

  nav: {
    todo: string
    done: string
    settings: string
    todoCount: (n: number) => string
    search: string
    timeTracker: string
  }

  timer: {
    listTitle: string
    addTask: string
    empty: string
    headerName: string
    headerTag: string
    headerTime: string
    modalAddTitle: string
    labelName: string
    placeholderName: string
    labelTag: string
    placeholderTag: string
    labelComments: string
    placeholderComments: string
    detailTitle: string
    edit: string
    start: string
    stop: string
    running: string
    created: string
    trackTime: string
    jumpToTracker: string
    fromTodo: string
    linkedBadge: string
    trackerBadge: string
    totalLabel: string
    staleBanner: (title: string, time: string) => string
    staleKeep: string
    staleStop: string
    staleDiscard: string
  }

  taskList: {
    titleTodo: string
    titleDone: string
    addTask: string
    emptyDone: string
    emptyTodo: string
    emptyFiltered: string
    noSearchResults: string
    onboardTitle: string
    onboardAdd: string
    onboardWidget: string
    onboardSettings: string
  }

  taskCard: {
    low: string
    normal: string
    high: string
    due: string
    markDone: string
    deleteTask: string
    deleteConfirm: string
    deleteYes: string
    deleteNo: string
    dragHandle: string
  }

  taskModal: {
    titleAdd: string
    titleEdit: string
    ariaAdd: string
    ariaEdit: string
    close: string
    labelTitle: string
    placeholderTitle: string
    labelDescription: string
    placeholderDescription: string
    labelPriority: string
    low: string
    normal: string
    high: string
    labelDueDate: string
    labelTags: string
    hintTags: string
    cancel: string
    saving: string
    saveChanges: string
    addTask: string
  }

  filterBar: {
    labelPriority: string
    all: string
    low: string
    normal: string
    high: string
    labelTag: string
    allTags: string
    labelSort: string
    sortDueDate: string
    sortPriority: string
    sortCreated: string
    sortManual: string
    clearFilters: string
    manualHint: string
  }

  tagInput: {
    placeholder: string
    remove: (tag: string) => string
  }

  settings: {
    title: string
    close: string
    navGeneral: string
    navTips: string

    labelTheme: string
    themeXP: string
    themeFlat: string
    themeDark: string
    themePeachy: string

    labelLanguage: string
    langEnglish: string
    langPolish: string

    labelOpenAtLogin: string
    descOpenAtLogin: string
    labelStartMinimized: string
    descStartMinimized: string
    labelCloseToTray: string
    descCloseToTray: string
    labelNotifications: string
    descNotifications: string
    labelWidgetAlwaysOnTop: string
    descWidgetAlwaysOnTop: string

    tipTheme: string
    tipLanguage: string
    tipOpenAtLogin: string
    tipStartMinimized: string
    tipCloseToTray: string
    tipNotifications: string
    tipWidgetAlwaysOnTop: string

    confirmYes: string
    cancel: string

    tipsDesc: string
    tipsGroupTaskList: string
    tipsEnterTask: string
    tipsEscape: string
    tipsGroupTaskForm: string
    tipsEnterTag: string
    tipsCommaTag: string
    tipsBackspaceTag: string
    tipsGroupApp: string
    tipsAddTask: string
    tipsQuickAdd: string
    tipsSearch: string
    tipsSwitchViews: string
    tipsQuit: string
    tipsGroupTaskDrag: string
    tipsDragReorder: string

    navUpdates: string
    labelVersion: string
    updatesDesc: string
    checkForUpdates: string
    checking: string
    updateAvailable: (version: string) => string
    updateNotAvailable: string
    downloading: string
    updateReady: string
    installUpdate: string
    updateErrorDev: string
    updateError: string
    updateBannerAvailable: (version: string) => string
    updateBannerReady: (version: string) => string
    updateBannerLater: string

    navBackup: string
    backupDesc: string
    exportTasks: string
    importHeader: string
    importDesc: string
    exportSuccess: (count: number) => string
    exportError: string
    importAppend: string
    importReplace: string
    importConfirmReplace: string
    importSuccess: (count: number) => string
    importNothing: string
  }

  widget: {
    enter: string
    exit: string
    tabTodo: string
    tabTimer: string
  }

  splash: {
    tasks: string[]
  }
}


function plTasks(n: number): string {
  if (n === 1) return '1 zadanie'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return `${n} zadania`
  return `${n} zadań`
}


export const en: Translations = {
  appName: 'DoneZone',

  search: {
    placeholder: 'Search title, tags, notes…',
    close: 'Close search',
  },

  titlebar: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    close: 'Close',
  },

  nav: {
    todo: 'To Do',
    done: 'Done',
    settings: 'Settings',
    todoCount: (n) => `${n} task${n !== 1 ? 's' : ''}`,
    search: 'Search',
    timeTracker: 'Time Tracker',
  },

  timer: {
    listTitle: 'Time Tracker',
    addTask: '+ Add Task',
    empty: 'No tracked tasks yet — add one to start measuring your time.',
    headerName: 'Task',
    headerTag: 'Tag',
    headerTime: 'Time',
    modalAddTitle: 'Add Timer Task',
    labelName: 'Task name',
    placeholderName: 'What are you working on?',
    labelTag: 'Tag',
    placeholderTag: 'e.g. project-x',
    labelComments: 'Comments',
    placeholderComments: 'Optional notes…',
    detailTitle: 'Task Details',
    edit: 'Edit',
    start: 'Start',
    stop: 'Stop',
    running: 'Running',
    created: 'Created',
    trackTime: 'Track time',
    jumpToTracker: 'Open in Time Tracker',
    fromTodo: 'Linked to a To Do task',
    linkedBadge: 'To Do',
    trackerBadge: 'Timer',
    totalLabel: 'Total',
    staleBanner: (title, time) => `Timer "${title}" kept running while the app was closed — ${time} so far.`,
    staleKeep: 'Keep running',
    staleStop: 'Stop & keep time',
    staleDiscard: 'Discard this run',
  },

  taskList: {
    titleTodo: 'To Do',
    titleDone: 'Done',
    addTask: '+ Add Task',
    emptyDone: 'Nothing completed yet.',
    emptyTodo: 'No tasks yet — hit "Add Task" to get started.',
    emptyFiltered: 'No tasks match the current filters.',
    noSearchResults: 'Nothing matches your search.',
    onboardTitle: 'Welcome to DoneZone!',
    onboardAdd: 'Click "+ Add Task" to create your first task — press N for quick add',
    onboardWidget: 'Try Widget Mode to keep your tasks floating above other windows',
    onboardSettings: 'Open Settings',
  },

  taskCard: {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    due: 'Due',
    markDone: 'Mark as done',
    deleteTask: 'Delete task',
    deleteConfirm: 'Delete?',
    deleteYes: 'Yes, delete',
    deleteNo: 'Cancel',
    dragHandle: 'Drag to reorder',
  },

  taskModal: {
    titleAdd: 'New Task',
    titleEdit: 'Edit Task',
    ariaAdd: 'New task',
    ariaEdit: 'Edit task',
    close: 'Close',
    labelTitle: 'Title',
    placeholderTitle: 'What needs to be done?',
    labelDescription: 'Description',
    placeholderDescription: 'Optional notes or details…',
    labelPriority: 'Priority',
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    labelDueDate: 'Due date',
    labelTags: 'Tags',
    hintTags: 'Press Enter or comma to add a tag',
    cancel: 'Cancel',
    saving: 'Saving…',
    saveChanges: 'Save Changes',
    addTask: 'Add Task',
  },

  filterBar: {
    labelPriority: 'Priority',
    all: 'All',
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    labelTag: 'Tag',
    allTags: 'All tags',
    labelSort: 'Sort by',
    sortDueDate: 'Due Date',
    sortPriority: 'Priority',
    sortCreated: 'Created Date',
    sortManual: 'Manual order',
    clearFilters: 'Clear filters',
    manualHint: 'Switch to "Manual order" to drag tasks into your own order',
  },

  tagInput: {
    placeholder: 'Add tags…',
    remove: (tag) => `Remove ${tag}`,
  },

  settings: {
    title: 'Settings',
    close: 'Close',
    navGeneral: 'General',
    navTips: 'Tips',

    labelTheme: 'Theme',
    themeXP: 'eXPerience',
    themeFlat: 'Flat',
    themeDark: 'eXPerience Dark',
    themePeachy: 'Peachy',

    labelLanguage: 'Language',
    langEnglish: 'English',
    langPolish: 'Polish',

    labelOpenAtLogin: 'Start automatically with Windows',
    descOpenAtLogin: 'Launch DoneZone when you log in.',
    labelStartMinimized: 'Start minimized to tray',
    descStartMinimized: 'When auto-started at login, open silently in the system tray instead of showing the window.',
    labelCloseToTray: 'Minimize to tray on close',
    descCloseToTray: 'Clicking × keeps DoneZone running in the system tray. Use the tray icon or Ctrl+Alt+T to reopen.',
    labelNotifications: 'Enable notifications',
    descNotifications: 'Show desktop alerts for new and due tasks.',
    labelWidgetAlwaysOnTop: 'Widget always on top',
    descWidgetAlwaysOnTop: 'Keep the widget window floating above all other windows.',

    tipTheme: 'Changes the visual style of the entire app. Switch between the classic eXPerience look, clean Flat style, dark grayscale, or warm Peachy.',
    tipLanguage: 'Sets the display language for all text in the app.',
    tipOpenAtLogin: 'Registers DoneZone in Windows startup so it launches automatically when you sign in.',
    tipStartMinimized: 'Only applies when the app is auto-started at login. The window stays hidden — open it from the tray icon.',
    tipCloseToTray: 'When enabled, pressing × hides the window but keeps the app running. Right-click the tray icon to quit fully.',
    tipNotifications: 'Displays a Windows desktop notification when a new task is created.',
    tipWidgetAlwaysOnTop: 'When on, the widget floats above other windows so it stays visible while you work. Turn off if you prefer it to behave like a normal window.',

    confirmYes: 'Yes, reset',
    cancel: 'Cancel',

    tipsDesc: 'Keyboard shortcuts and tips for using DoneZone efficiently.',
    tipsGroupTaskList: 'Task list',
    tipsEnterTask: 'Open / edit the focused task',
    tipsEscape: 'Close any open dialog or panel',
    tipsGroupTaskForm: 'Task form',
    tipsEnterTag: 'Add a tag in the tag field',
    tipsCommaTag: 'Add a tag in the tag field',
    tipsBackspaceTag: 'Remove the last tag (when tag field is empty)',
    tipsGroupApp: 'Application',
    tipsAddTask: 'Add a new task (global shortcut — works even when minimized)',
    tipsQuickAdd: 'Add a new task (or timer task in the Time Tracker view)',
    tipsSearch: 'Search the current view (Escape closes search)',
    tipsSwitchViews: 'Switch between To Do, Done and Time Tracker',
    tipsQuit: 'Quit DoneZone',
    tipsGroupTaskDrag: 'Drag & reorder',
    tipsDragReorder: 'Drag a task up or down to reorder (switch Sort to "Manual order" first)',

    navUpdates: 'Updates',
    labelVersion: 'Version',
    updatesDesc: 'Check for a newer version of DoneZone. Updates download and install silently in the background — just restart to apply.',
    checkForUpdates: 'Check for updates',
    checking: 'Checking…',
    updateAvailable: (v) => `Version ${v} is available`,
    updateNotAvailable: 'You are on the latest version.',
    downloading: 'Downloading update…',
    updateReady: 'Update downloaded — restart to apply.',
    installUpdate: 'Restart to update',
    updateErrorDev: 'Updates are only available in the packaged app.',
    updateError: 'Update check failed.',
    updateBannerAvailable: (v) => `DoneZone ${v} is available — downloading…`,
    updateBannerReady: (v) => `DoneZone ${v} downloaded — restart to apply.`,
    updateBannerLater: 'Later',

    navBackup: 'Backup',
    backupDesc: 'Export all your tasks to a JSON file for safekeeping, or import a previously saved backup.',
    importHeader: 'Import tasks',
    importDesc: 'Choose a previously exported JSON backup file to restore your tasks.',
    exportTasks: 'Export tasks',
    exportSuccess: (n) => `Exported ${n} task${n !== 1 ? 's' : ''} successfully.`,
    exportError: 'Export failed.',
    importAppend: 'Append to existing tasks',
    importReplace: 'Replace all tasks',
    importConfirmReplace: 'This will permanently delete all current tasks and replace them with the backup. Continue?',
    importSuccess: (n) => `Imported ${n} task${n !== 1 ? 's' : ''} successfully.`,
    importNothing: 'Nothing to import — no tasks found in the file.',
  },

  widget: {
    enter: 'Widget Mode',
    exit: 'Exit Widget Mode',
    tabTodo: 'To Do',
    tabTimer: 'Timer',
  },

  splash: {
    tasks: [
      'Review meeting notes',
      'Send follow-up emails',
      'Schedule team demo',
      'Update project tracker',
    ],
  },
}


export const pl: Translations = {
  appName: 'DoneZone',

  search: {
    placeholder: 'Szukaj w tytule, tagach, opisie…',
    close: 'Zamknij wyszukiwanie',
  },

  titlebar: {
    minimize: 'Minimalizuj',
    maximize: 'Maksymalizuj',
    restore: 'Przywróć',
    close: 'Zamknij',
  },

  nav: {
    todo: 'Do zrobienia',
    done: 'Zrobione',
    settings: 'Ustawienia',
    todoCount: (n) => `${n} ${n === 1 ? 'zadanie' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'zadania' : 'zadań'}`,
    search: 'Szukaj',
    timeTracker: 'Śledzenie czasu',
  },

  timer: {
    listTitle: 'Śledzenie czasu',
    addTask: '+ Dodaj zadanie',
    empty: 'Brak śledzonych zadań — dodaj pierwsze, aby mierzyć czas.',
    headerName: 'Zadanie',
    headerTag: 'Tag',
    headerTime: 'Czas',
    modalAddTitle: 'Dodaj zadanie z licznikiem',
    labelName: 'Nazwa zadania',
    placeholderName: 'Nad czym pracujesz?',
    labelTag: 'Tag',
    placeholderTag: 'np. projekt-x',
    labelComments: 'Komentarze',
    placeholderComments: 'Opcjonalne notatki…',
    detailTitle: 'Szczegóły zadania',
    edit: 'Edytuj',
    start: 'Start',
    stop: 'Stop',
    running: 'W trakcie',
    created: 'Utworzono',
    trackTime: 'Śledź czas',
    jumpToTracker: 'Otwórz w Śledzeniu czasu',
    fromTodo: 'Połączone z zadaniem Do zrobienia',
    linkedBadge: 'To Do',
    trackerBadge: 'Licznik',
    totalLabel: 'Razem',
    staleBanner: (title, time) => `Licznik „${title}" działał, gdy aplikacja była zamknięta — łącznie ${time}.`,
    staleKeep: 'Zostaw włączony',
    staleStop: 'Zatrzymaj i zachowaj czas',
    staleDiscard: 'Odrzuć ten pomiar',
  },

  taskList: {
    titleTodo: 'Do zrobienia',
    titleDone: 'Zrobione',
    addTask: '+ Dodaj zadanie',
    emptyDone: 'Brak ukończonych zadań.',
    emptyTodo: 'Brak zadań — kliknij „Dodaj zadanie", aby zacząć.',
    emptyFiltered: 'Żadne zadania nie pasują do filtrów.',
    noSearchResults: 'Nic nie pasuje do wyszukiwania.',
    onboardTitle: 'Witaj w DoneZone!',
    onboardAdd: 'Kliknij „+ Dodaj zadanie", aby utworzyć pierwsze zadanie — lub naciśnij N',
    onboardWidget: 'Wypróbuj tryb widżetu, aby mieć zadania zawsze nad innymi oknami',
    onboardSettings: 'Otwórz ustawienia',
  },

  taskCard: {
    low: 'Niski',
    normal: 'Normalny',
    high: 'Wysoki',
    due: 'Termin',
    markDone: 'Oznacz jako zrobione',
    deleteTask: 'Usuń zadanie',
    deleteConfirm: 'Usunąć?',
    deleteYes: 'Tak, usuń',
    deleteNo: 'Anuluj',
    dragHandle: 'Przeciągnij, aby zmienić kolejność',
  },

  taskModal: {
    titleAdd: 'Nowe zadanie',
    titleEdit: 'Edytuj zadanie',
    ariaAdd: 'Nowe zadanie',
    ariaEdit: 'Edytuj zadanie',
    close: 'Zamknij',
    labelTitle: 'Tytuł',
    placeholderTitle: 'Co trzeba zrobić?',
    labelDescription: 'Opis',
    placeholderDescription: 'Opcjonalne notatki lub szczegóły…',
    labelPriority: 'Priorytet',
    low: 'Niski',
    normal: 'Normalny',
    high: 'Wysoki',
    labelDueDate: 'Termin',
    labelTags: 'Tagi',
    hintTags: 'Naciśnij Enter lub przecinek, aby dodać tag',
    cancel: 'Anuluj',
    saving: 'Zapisywanie…',
    saveChanges: 'Zapisz zmiany',
    addTask: 'Dodaj zadanie',
  },

  filterBar: {
    labelPriority: 'Priorytet',
    all: 'Wszystkie',
    low: 'Niski',
    normal: 'Normalny',
    high: 'Wysoki',
    labelTag: 'Tag',
    allTags: 'Wszystkie tagi',
    labelSort: 'Sortuj według',
    sortDueDate: 'Termin',
    sortPriority: 'Priorytet',
    sortCreated: 'Data utworzenia',
    sortManual: 'Kolejność ręczna',
    clearFilters: 'Wyczyść filtry',
    manualHint: 'Przełącz na „Kolejność ręczną", aby układać zadania przeciąganiem',
  },

  tagInput: {
    placeholder: 'Dodaj tagi…',
    remove: (tag) => `Usuń ${tag}`,
  },

  settings: {
    title: 'Ustawienia',
    close: 'Zamknij',
    navGeneral: 'Ogólne',
    navTips: 'Wskazówki',

    labelTheme: 'Motyw',
    themeXP: 'eXPerience',
    themeFlat: 'Flat',
    themeDark: 'eXPerience Ciemny',
    themePeachy: 'Peachy',

    labelLanguage: 'Język',
    langEnglish: 'Angielski',
    langPolish: 'Polski',

    labelOpenAtLogin: 'Uruchamiaj automatycznie z Windows',
    descOpenAtLogin: 'Uruchamiaj DoneZone podczas logowania.',
    labelStartMinimized: 'Uruchamiaj zminimalizowany do zasobnika',
    descStartMinimized: 'Przy automatycznym uruchomieniu po zalogowaniu otwieraj cicho w zasobniku systemowym zamiast pokazywać okno.',
    labelCloseToTray: 'Minimalizuj do zasobnika przy zamknięciu',
    descCloseToTray: 'Kliknięcie × pozostawia DoneZone działający w zasobniku systemowym. Użyj ikony w zasobniku lub Ctrl+Alt+T, aby otworzyć ponownie.',
    labelNotifications: 'Włącz powiadomienia',
    descNotifications: 'Pokazuj powiadomienia pulpitu dla nowych i terminowych zadań.',
    labelWidgetAlwaysOnTop: 'Widżet zawsze na wierzchu',
    descWidgetAlwaysOnTop: 'Okno widżetu będzie unosić się ponad innymi oknami.',

    tipTheme: 'Zmienia wygląd całej aplikacji. Wybierz między klasycznym eXPerience, schludnym Flat, ciemnym grayscale lub ciepłym Peachy.',
    tipLanguage: 'Ustawia język wyświetlania dla całego tekstu w aplikacji.',
    tipOpenAtLogin: 'Rejestruje DoneZone w autostarcie Windows, aby uruchamiał się automatycznie po zalogowaniu.',
    tipStartMinimized: 'Działa tylko przy automatycznym uruchomieniu po zalogowaniu. Okno pozostaje ukryte — otwórz je z ikony w zasobniku.',
    tipCloseToTray: 'Po włączeniu naciśnięcie × ukrywa okno, ale aplikacja działa dalej. Kliknij prawym przyciskiem ikonę w zasobniku, aby całkowicie zamknąć.',
    tipNotifications: 'Wyświetla powiadomienie pulpitu Windows, gdy nowe zadanie zostanie utworzone.',
    tipWidgetAlwaysOnTop: 'Gdy włączone, widżet unosi się ponad innymi oknami, pozostając widoczny podczas pracy. Wyłącz, jeśli wolisz normalne zachowanie okna.',

    confirmYes: 'Tak, resetuj',
    cancel: 'Anuluj',

    tipsDesc: 'Skróty klawiaturowe i wskazówki dotyczące efektywnego korzystania z DoneZone.',
    tipsGroupTaskList: 'Lista zadań',
    tipsEnterTask: 'Otwórz / edytuj zaznaczone zadanie',
    tipsEscape: 'Zamknij otwarte okno dialogowe lub panel',
    tipsGroupTaskForm: 'Formularz zadania',
    tipsEnterTag: 'Dodaj tag w polu tagów',
    tipsCommaTag: 'Dodaj tag w polu tagów',
    tipsBackspaceTag: 'Usuń ostatni tag (gdy pole tagów jest puste)',
    tipsGroupApp: 'Aplikacja',
    tipsAddTask: 'Dodaj nowe zadanie (skrót globalny — działa nawet gdy aplikacja jest zminimalizowana)',
    tipsQuickAdd: 'Dodaj nowe zadanie (lub zadanie z licznikiem w widoku Śledzenia czasu)',
    tipsSearch: 'Szukaj w bieżącym widoku (Escape zamyka wyszukiwanie)',
    tipsSwitchViews: 'Przełączaj między widokami Do zrobienia, Zrobione i Śledzenie czasu',
    tipsQuit: 'Zamknij DoneZone',
    tipsGroupTaskDrag: 'Przeciąganie i kolejność',
    tipsDragReorder: 'Przeciągnij zadanie w górę lub w dół, aby je przestawić (najpierw przełącz sortowanie na „Kolejność ręczna")',

    navUpdates: 'Aktualizacje',
    labelVersion: 'Wersja',
    updatesDesc: 'Sprawdź nowszą wersję DoneZone. Aktualizacje są pobierane i instalowane w tle — wystarczy uruchomić ponownie, aby zastosować.',
    checkForUpdates: 'Sprawdź aktualizacje',
    checking: 'Sprawdzanie…',
    updateAvailable: (v) => `Dostępna wersja ${v}`,
    updateNotAvailable: 'Masz najnowszą wersję.',
    downloading: 'Pobieranie aktualizacji…',
    updateReady: 'Aktualizacja pobrana — uruchom ponownie, aby zastosować.',
    installUpdate: 'Uruchom ponownie i zaktualizuj',
    updateErrorDev: 'Aktualizacje są dostępne tylko w spakowanej aplikacji.',
    updateError: 'Sprawdzanie aktualizacji nie powiodło się.',
    updateBannerAvailable: (v) => `DoneZone ${v} jest dostępny — pobieranie…`,
    updateBannerReady: (v) => `DoneZone ${v} pobrany — uruchom ponownie, aby zastosować.`,
    updateBannerLater: 'Później',

    navBackup: 'Kopia zapasowa',
    backupDesc: 'Eksportuj wszystkie zadania do pliku JSON lub zaimportuj wcześniej zapisaną kopię zapasową.',
    importHeader: 'Importuj zadania',
    importDesc: 'Wybierz wcześniej wyeksportowany plik JSON, aby przywrócić zadania.',
    exportTasks: 'Eksportuj zadania',
    exportSuccess: (n) => `Wyeksportowano ${plTasks(n)}.`,
    exportError: 'Eksport nie powiódł się.',
    importAppend: 'Dodaj do istniejących zadań',
    importReplace: 'Zastąp wszystkie zadania',
    importConfirmReplace: 'Spowoduje to trwałe usunięcie wszystkich bieżących zadań i zastąpienie ich kopią zapasową. Kontynuować?',
    importSuccess: (n) => `Zaimportowano ${plTasks(n)}.`,
    importNothing: 'Nic nie zaimportowano — w pliku nie znaleziono zadań.',
  },

  widget: {
    enter: 'Tryb widżetu',
    exit: 'Wyjdź z trybu widżetu',
    tabTodo: 'Zadania',
    tabTimer: 'Licznik',
  },

  splash: {
    tasks: [
      'Przejrzyj notatki ze spotkań',
      'Wyślij e-maile uzupełniające',
      'Zaplanuj prezentację dla zespołu',
      'Zaktualizuj śledzenie projektu',
    ],
  },
}

export const translations: Record<Language, Translations> = { en, pl }
