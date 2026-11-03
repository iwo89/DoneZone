import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Theme = 'xp' | 'flat' | 'dark' | 'peachy'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'xp',
  setTheme: () => {},
})

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'xp' || stored === 'flat' || stored === 'dark' || stored === 'peachy') return stored
  return 'xp'
}

function applyTheme(t: Theme): void {
  if (t === 'xp') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', t)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => { applyTheme(theme) }, [theme])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem('theme', next)
    setThemeState(next)
    applyTheme(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
