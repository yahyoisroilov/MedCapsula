'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])

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

  useEffect(() => {
    if (session) {
      fetch('/api/progress')
        .then(r => r.json())
        .then(setProgress)
    }
  }, [session])

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-2xl p-10 inline-block">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Kirish talab qilinadi</h2>
          <p className="text-sm text-gray-400">Iltimos, tizimga kiring yoki ro'yxatdan o'ting.</p>
          <Link href="/auth/login" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">
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
  const avg = enrollments.length > 0
    ? Math.round(enrollments.reduce((a: number, e: any) => a + e.pct, 0) / enrollments.length)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Mening kabinetim</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fanlardagi yutuqlaringiz va davom etilgan mavzular.</p>
        </div>
        <Link href="/" className="accent-bg rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Yangi fan
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-extrabold accent-text">{enrollments.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fanlar</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-extrabold accent-text">{completedCourses}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tugatilgan fanlar</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-extrabold accent-text">{avg}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">O'rtacha taraqqiyot</div>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Mening fanlarim</h2>
      {enrollments.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <i className="fa-solid fa-book text-gray-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-700 dark:text-gray-200">Hali fanlar mavjud emas</h3>
          <p className="text-xs text-gray-400 mt-1">Fanlarni ko'rib chiqish va o'rganishni boshlash uchun pastdagi tugmani bosing.</p>
          <Link href="/" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">
            Fanlarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((e: any) => (
            <Link
              key={e.id}
              href={`/subjects/${e.slug}`}
              className="block text-left glass rounded-2xl p-5 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <i className={`fa-solid ${e.icon || 'fa-book-medical'} text-white text-lg`}></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 dark:text-white leading-tight">{e.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{e.totalTopics} ta mavzu</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-gray-500 dark:text-gray-400">{e.pct}% tugatildi</span>
                <span className="accent-text">{e.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full accent-grad rounded-full transition-all" style={{ width: `${e.pct}%` }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
