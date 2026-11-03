import React, { createContext, useContext, useState, useCallback } from 'react'
import { type Language, type Translations, translations } from './i18n'

interface LanguageContextValue {
  lang: Language
  t: Translations
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: translations.en,
  setLang: () => {},
})

function getStoredLanguage(): Language {
  const stored = localStorage.getItem('language')
  return stored === 'pl' ? 'pl' : 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [lang, setLangState] = useState<Language>(getStoredLanguage)

  const setLang = useCallback((next: Language) => {
    localStorage.setItem('language', next)
    setLangState(next)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT(): Translations {
  return useContext(LanguageContext).t
}

export function useLang(): { lang: Language; setLang: (l: Language) => void } {
  const { lang, setLang } = useContext(LanguageContext)
  return { lang, setLang }
}
