'use client'

import { useEffect } from 'react'

export function ThemeProvider() {
  useEffect(() => {
    const stored = localStorage.getItem('medCapsula_theme')
    if (stored === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return null
}
