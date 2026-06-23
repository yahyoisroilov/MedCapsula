'use client'

import { useEffect } from 'react'

export function ThemeProvider() {
  useEffect(() => {
    const stored = localStorage.getItem('medCapsula_theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}
