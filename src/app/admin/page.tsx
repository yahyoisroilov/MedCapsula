'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { BookOpen, User, GraduationCap } from '@/components/ui/icons'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState({ courses: 0, users: 0, activities: 0 })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
  }, [])

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then((data) => {
        setCourses(data)
        setStats(prev => ({ ...prev, courses: data.length }))
      })
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/progress')
        .then(r => r.json())
        .then((data) => setStats(prev => ({ ...prev, activities: data.length })))
    }
  }, [session])

  if (!session || session.role !== 'admin') {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center sm:px-10">
        <div className="mc-card inline-block p-10">
          <h2 className="font-serif text-xl font-semibold text-[#b3493d]">Ruxsat yo'q</h2>
          <p className="mt-2 text-sm text-ink-mute">Faqat adminlar uchun.</p>
          <Button href="/" size="sm" className="mt-4">Bosh sahifa</Button>
        </div>
      </div>
    )
  }

  const cards = [
    { value: stats.courses, label: 'Fanlar', icon: <BookOpen className="h-5 w-5" />, tone: 'green' as const },
    { value: stats.users, label: 'Foydalanuvchilar', icon: <User className="h-5 w-5" />, tone: 'blue' as const },
    { value: stats.activities, label: 'Faoliyatlar', icon: <GraduationCap className="h-5 w-5" />, tone: 'green' as const },
  ]

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <div>
        <span className="mc-label">Admin</span>
        <h1 className="mt-2 font-serif text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em] text-ink">
          Admin panel
        </h1>
        <p className="mt-1 text-sm text-ink-mute">Fanlar va foydalanuvchilarni boshqarish.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(c => (
          <div key={c.label} className="mc-card p-5">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  c.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
                }`}
              >
                {c.icon}
              </div>
              <div className="font-serif text-[34px] font-semibold text-ink">{c.value}</div>
            </div>
            <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="mc-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">Tezkor amallar</h2>
          <div className="mt-4 space-y-3">
            <Button href="/admin/courses" size="sm" className="w-full">Fanlarni boshqarish</Button>
            <Button href="/admin/courses" variant="secondary" size="sm" className="w-full">Yangi fan qo'shish</Button>
          </div>
        </div>
        <div className="mc-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">Umumiy ma'lumot</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-mute">
            Platformada {stats.courses} ta fan, {stats.users} ta foydalanuvchi va {stats.activities} ta faoliyat mavjud.
          </p>
        </div>
      </div>
    </div>
  )
}
