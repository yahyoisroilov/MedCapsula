'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, User, GraduationCap, RotateCw } from '@/components/ui/icons'
import { CapsuleLoader } from '@/components/ui/CapsuleLoader'

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [stats, setStats] = useState({ courses: 0, users: 0, activities: 0 })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return
      if (!user) { router.replace('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (cancelled) return
      if (profile?.role !== 'admin') { setSession(null); setChecking(false); return }
      setSession(user)
      const res = await fetch('/api/admin/stats')
      if (!cancelled && res.ok) {
        setStats(await res.json())
      }
      if (!cancelled) setChecking(false)
    })
    return () => { cancelled = true }
  }, [router])

  if (checking) {
    return <div className="relative z-[2] flex min-h-[60vh] items-center justify-center px-5 sm:px-10"><CapsuleLoader size="md" /></div>
  }

  if (!session) {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center sm:px-10">
        <div className="mx-auto inline-block rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-10 shadow-card">
          <h2 className="font-serif text-lg font-semibold text-[#b3493d] mb-2">Ruxsat yo'q</h2>
          <p className="text-sm text-ink-mute">Faqat adminlar uchun.</p>
          <Link href="/" className="btn-sm mx-auto mt-4">Bosh sahifa</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-ink">Admin panel</h1>
          <p className="text-sm text-ink-mute mt-1">Fanlar va foydalanuvchilarni boshqarish.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="mc-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand text-sand flex items-center justify-center shadow-btn-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="font-serif text-3xl font-semibold text-ink">{stats.courses}</div>
          </div>
          <div className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">Fanlar</div>
        </div>
        <div className="mc-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-sky-tint text-sky flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="font-serif text-3xl font-semibold text-ink">{stats.users}</div>
          </div>
          <div className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">Foydalanuvchilar</div>
        </div>
        <div className="mc-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand-tint text-brand flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="font-serif text-3xl font-semibold text-ink">{stats.activities}</div>
          </div>
          <div className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">Faoliyatlar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="mc-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Tezkor amallar</h2>
          <div className="space-y-3">
            <Link href="/admin/courses" className="bg-brand text-sand rounded-xl px-4 py-3 text-sm font-semibold block text-center transition-colors hover:bg-brand-dark">Fanlarni boshqarish</Link>
          </div>
        </div>
        <div className="mc-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Umumiy ma'lumot</h2>
          <p className="text-sm text-ink-mute leading-relaxed">
            Platformada {stats.courses} ta fan, {stats.users} ta foydalanuvchi va {stats.activities} ta faoliyat mavjud.
          </p>
        </div>
      </div>
    </div>
  )
}
