'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NotesEditor } from '@/components/subjects/NotesEditor'
import { createClient } from '@/lib/supabase/client'

export default function NotesPage() {
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

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
        email: user.email,
        name: profile?.name || user.user_metadata?.name || '',
        role: profile?.role || 'student',
      })
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('courses').select('*').eq('published', true).order('created_at', { ascending: true }).then(({ data }) => {
      const mapped = (data || []).map((c: any) => ({ ...c, totalTopics: 0 }))
      setCourses(mapped)
      if (mapped.length > 0) setSelectedCourseId(mapped[0].id)
    })
  }, [])

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-2xl p-10 inline-block">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Kirish talab qilinadi</h2>
          <p className="text-sm text-gray-400">Iltimos, tizimga kiring yoki ro'yxatdan o'ting.</p>
          <Link href="/auth/login?redirect=/notes" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">
            Kirish
          </Link>
        </div>
      </div>
    )
  }

  const selectedCourse = courses.find((c: any) => c.id === selectedCourseId) || courses[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Qaydlar</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Har bir fan uchun shaxsiy qaydlaringizni yozing va saqlang.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-gray-400">Hozircha fanlar yo'q.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
          <aside className="hidden md:block glass rounded-2xl p-3 space-y-1 h-fit sticky top-24">
            {courses.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                  c.id === selectedCourseId
                    ? 'accent-bg'
                    : 'hover:bg-gray-200/60 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                }`}
              >
                <i className={`fa-solid ${c.icon || 'fa-book-medical'} text-xs ${c.id === selectedCourseId ? 'text-white' : 'text-gray-400'}`}></i>
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </aside>

          <div className="md:hidden mb-4">
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full glass rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg accent-grad flex items-center justify-center shrink-0">
                <i className={`fa-solid ${selectedCourse?.icon || 'fa-book-medical'} text-white text-sm`}></i>
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white">{selectedCourse?.title}</h3>
            </div>
            {selectedCourseId && <NotesEditor courseId={selectedCourseId} />}
          </div>
        </div>
      )}
    </div>
  )
}
