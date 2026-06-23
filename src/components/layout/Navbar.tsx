'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type NavSession = {
  id: string
  email: string
  name: string
  role: string
} | null

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<NavSession>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('medCapsula_theme')
    const isDark = stored === 'dark' || stored === null
    setDark(isDark)
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setSession(null); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()
      setSession({
        id: user.id,
        email: user.email!,
        name: profile?.name || user.user_metadata?.name || '',
        role: profile?.role || 'student',
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setSession(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const tabs = [
    { id: 'fanlar', href: '/subjects', label: 'Fanlar', icon: 'fa-graduation-cap' },
    { id: 'qaydlar', href: '/notes', label: 'Qaydlar', icon: 'fa-note-sticky' },
  ]

  const handleLogout = async () => {
    setSession(null)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 glass border-b border-black/5 dark:border-white/5 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <div className="h-10 w-10 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-capsules text-white text-xl"></i>
          </div>
          <span className="text-gray-900 dark:text-white font-extrabold text-xl sm:text-2xl tracking-tight">
            Med<span className="text-emerald-500">Capsula</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 mr-2">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition text-sm font-bold',
                  isActive(tab.href)
                    ? 'accent-bg shadow-sm shadow-emerald-500/30'
                    : 'bg-gray-200/60 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
                )}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => {
              const next = !dark
              setDark(next)
              document.documentElement.classList.toggle('dark', next)
              localStorage.setItem('medCapsula_theme', next ? 'dark' : 'light')
            }}
            className="p-2.5 rounded-xl bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:text-emerald-400 transition-colors"
            title="Tema"
          >
            <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            {session ? (
              <>
                {session.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-200 dark:bg-white/5 px-3 py-2 rounded-xl"
                  >
                    <i className="fa-solid fa-shield-halved sm:mr-2 text-cyan-400"></i>
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-200 dark:bg-white/5 px-3 py-2 rounded-xl"
                >
                  <i className="fa-solid fa-user text-cyan-400 sm:mr-2"></i>
                  <span className="hidden sm:inline">{session.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors bg-gray-200 dark:bg-white/5 px-3 py-2 rounded-xl"
                >
                  <i className="fa-solid fa-right-from-bracket sm:mr-2"></i>
                  <span className="hidden sm:inline">Chiqish</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-200 dark:bg-white/5 px-3 sm:px-4 py-2 rounded-xl"
                >
                  <i className="fa-solid fa-right-to-bracket sm:mr-2 text-cyan-400"></i>
                  <span className="hidden sm:inline">Kirish</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="accent-bg rounded-xl px-3 sm:px-4 py-2 text-sm font-bold whitespace-nowrap shrink-0"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          <a
            href="https://t.me/Med_Capsula"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl transition hover:bg-emerald-500/20"
          >
            <i className="fa-brands fa-telegram text-base"></i>
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-black/5 dark:border-white/10 space-y-1">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition',
                isActive(tab.href) ? 'accent-bg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5'
              )}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              {tab.label}
            </Link>
          ))}
          <div className="border-t border-black/5 dark:border-white/10 pt-1 mt-1">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5 rounded-xl">Dashboard</Link>
                {session.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5 rounded-xl">Admin</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm font-semibold text-red-500 hover:bg-gray-200/60 dark:hover:bg-white/5 rounded-xl">Chiqish</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5 rounded-xl">Kirish</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-semibold accent-bg rounded-xl mt-1">Ro'yxatdan o'tish</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
