'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-2xl p-10 inline-block">
          <h2 className="font-bold text-red-500 mb-2">Ruxsat yo'q</h2>
          <Link href="/" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">Bosh sahifa</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/admin" className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5">
        <i className="fa-solid fa-arrow-left"></i> Admin panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Fanlarni boshqarish</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fanlar va mavzularni tahrirlash, video yuklash.</p>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map((c: any) => (
          <Link
            key={c.id}
            href={`/admin/courses/${c.slug}`}
            className="flex items-center gap-4 glass rounded-2xl p-4 hover:-translate-y-0.5 transition-all"
          >
            <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <i className={`fa-solid ${c.icon || 'fa-book-medical'} text-white text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-xs text-gray-400">{c.totalTopics || 0} ta mavzu</p>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-500"></i>
          </Link>
        ))}
      </div>
    </div>
  )
}
