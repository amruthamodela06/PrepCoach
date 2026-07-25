import { useCallback, useState } from 'react'

const THEME_KEY = 'prepcoach-theme'

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  )

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // ignore storage failures (private browsing, etc.)
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
