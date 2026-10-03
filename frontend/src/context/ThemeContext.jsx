/**
 * ThemeContext
 * src/context/ThemeContext.jsx
 */
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('muse-theme')
    return stored === 'light' || stored === 'dark' ? stored : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('muse-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => current === 'dark' ? 'light' : 'dark')
  }
  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside <ThemeProvider>')
  return ctx
}