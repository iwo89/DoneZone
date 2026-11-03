import React from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from './LanguageContext'
import { ThemeProvider } from './ThemeContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
