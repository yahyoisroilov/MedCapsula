'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CapsuleMark, Menu, X, ArrowRight, Shield, LogOut } from '@/components/ui/icons'

type NavSession = {
  id: string
  email: string
  name: string
  role: string
} | null

const tabs = [
  { href: '/subjects', label: 'Fanlar' },
  { href: '/notes', label: 'Qaydlar' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<NavSession>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(setSession)
      .catch(() => setSession(null))
  }, [pathname])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(43,39,34,0.10)] bg-[rgba(245,240,230,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-5 py-4 sm:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <CapsuleMark className="shadow-[0_1px_2px_rgba(43,39,34,0.12)]" />
          <span className="font-serif text-xl font-semibold tracking-[-0.01em] text-ink">
            Med<span className="text-brand">Capsula</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {tabs.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'text-[15px] transition-colors',
                isActive(t.href)
                  ? 'font-semibold text-brand'
                  : 'text-ink-mute hover:text-ink',
              )}
            >
              {t.label}
            </Link>
          ))}

          <span className="h-[18px] w-px bg-[rgba(43,39,34,0.15)]" />

          {session ? (
            <div className="flex items-center gap-3">
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink-mute hover:text-ink"
                >
                  <Shield className="h-4 w-4 text-sky" /> Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 rounded-full bg-brand py-2 pl-2 pr-3.5 text-sm font-semibold text-sand shadow-btn-sm hover:bg-brand-dark"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-tint font-serif text-[13px] text-brand">
                  {(session.name || 'U').charAt(0).toUpperCase()}
                </span>
                Profil
              </Link>
              <button
                onClick={handleLogout}
                title="Chiqish"
                className="text-ink-faint transition-colors hover:text-brand"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-[15px] font-medium text-ink hover:text-brand">
                Kirish
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-[9px] bg-brand px-4 py-2.5 text-sm font-semibold text-sand shadow-btn-sm hover:bg-brand-dark"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand-card text-ink md:hidden"
          aria-label="Menyu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[rgba(43,39,34,0.10)] bg-sand px-5 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {tabs.map(t => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                  isActive(t.href) ? 'bg-brand-tint text-brand' : 'text-ink-mute hover:bg-sand-card',
                )}
              >
                {t.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-[rgba(43,39,34,0.10)]" />
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-mute hover:bg-sand-card">
                  Profil
                </Link>
                {session.role === 'admin' && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-mute hover:bg-sand-card">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-brand hover:bg-sand-card">
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-mute hover:bg-sand-card">
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2.5 text-[15px] font-semibold text-sand"
                >
                  Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
