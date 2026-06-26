'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, BookOpen, ChevronRight } from '@/components/ui/icons'

export default function AdminCoursesPage() {
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
  }, [])

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(setCourses)
  }, [])

  if (!session || session.role !== 'admin') {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center sm:px-10">
        <div className="mc-card inline-block p-10">
          <h2 className="font-serif text-xl font-semibold text-[#b3493d]">Ruxsat yo'q</h2>
          <Button href="/" size="sm" className="mt-4">Bosh sahifa</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Admin panel
      </Link>

      <div className="mt-8">
        <span className="mc-label">Admin</span>
        <h1 className="mt-2 font-serif text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em] text-ink">
          Fanlarni boshqarish
        </h1>
        <p className="mt-1 text-sm text-ink-mute">Fanlar va mavzularni tahrirlash, video yuklash.</p>
      </div>

      <div className="mt-8 space-y-3">
        {courses.map((c: any) => (
          <Link
            key={c.id}
            href={`/admin/courses/${c.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-[rgba(43,39,34,0.10)] bg-sand-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-line hover:shadow-lift"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-[19px] font-semibold text-ink">{c.title}</h3>
              <p className="mt-0.5 font-mono text-[12px] text-ink-faint">{c.totalTopics || 0} ta mavzu</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-dim transition-colors group-hover:text-brand" />
          </Link>
        ))}
      </div>
    </div>
  )
}
