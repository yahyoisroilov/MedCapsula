'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from '@/components/ui/icons'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(setSession)
  }, [])

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/progress')
        .then(r => r.json())
        .then(setProgress)
    }
  }, [session])

  if (!session) {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-24 text-center sm:px-10">
        <div className="mx-auto inline-block rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-10 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-ink">Kirish talab qilinadi</h2>
          <p className="mt-2 text-sm text-ink-mute">Iltimos, tizimga kiring yoki ro&apos;yxatdan o&apos;ting.</p>
          <Link href="/auth/login" className="btn-sm mx-auto mt-5">
            Kirish
          </Link>
        </div>
      </div>
    )
  }

  const progressMap: Record<string, number> = {}
  for (const p of progress) {
    if (p.step === 'done') {
      progressMap[p.course_id] = (progressMap[p.course_id] || 0) + 1
    }
  }

  const enrollments = courses.map((c: any) => ({
    ...c,
    doneTopics: progressMap[c.id] || 0,
    pct: c.totalTopics > 0 ? Math.round(((progressMap[c.id] || 0) / c.totalTopics) * 100) : 0,
  }))

  const completedCourses = enrollments.filter((e: any) => e.pct >= 100).length
  const avg =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((a: number, e: any) => a + e.pct, 0) / enrollments.length)
      : 0

  const stats = [
    { value: enrollments.length, label: 'Fanlar' },
    { value: completedCourses, label: 'Tugatilgan fanlar' },
    { value: `${avg}%`, label: "O'rtacha taraqqiyot" },
  ]

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mc-label">Kabinet</span>
          <h1 className="mt-2 font-serif text-[clamp(28px,3.4vw,42px)] font-semibold tracking-[-0.02em] text-ink">
            Salom, {session.name?.split(' ')[0] || 'talaba'}
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-mute">
            Fanlardagi yutuqlaringiz va davom etilgan mavzular.
          </p>
        </div>
        <Link href="/subjects" className="btn-sm">
          Fanlarni ko&apos;rish <ArrowRight className="h-[18px] w-[18px]" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-6 shadow-card">
            <div className="font-serif text-[34px] font-semibold text-brand">{s.value}</div>
            <div className="mt-1 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-5 mt-12 font-serif text-2xl font-semibold text-ink">Mening fanlarim</h2>
      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(43,39,34,0.2)] p-12 text-center">
          <h3 className="font-serif text-xl text-ink-mute">Hali fanlar mavjud emas</h3>
          <p className="mt-1.5 text-sm text-ink-faint">
            Fanlarni ko&apos;rib chiqish va o&apos;rganishni boshlash uchun quyidagi tugmani bosing.
          </p>
          <Link href="/subjects" className="btn-sm mx-auto mt-5">
            Fanlarni ko&apos;rish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e: any, i: number) => (
            <Link
              key={e.id}
              href={`/subjects/${e.slug}`}
              className="group flex flex-col rounded-2xl border border-[rgba(43,39,34,0.12)] bg-sand-card p-6 shadow-card transition-all hover:-translate-y-[3px] hover:border-brand-line hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ChevronRight className="h-[18px] w-[18px] text-brand opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-3 font-serif text-[22px] font-semibold text-ink">{e.title}</h3>
              <p className="mt-1 text-[13px] text-ink-faint">{e.totalTopics} ta mavzu</p>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between font-mono text-[12px]">
                  <span className="text-ink-faint">{e.doneTopics}/{e.totalTopics} tugatildi</span>
                  <span className="text-brand">{e.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(43,39,34,0.08)]">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${e.pct}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
