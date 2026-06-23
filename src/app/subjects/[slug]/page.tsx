'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TopicRow } from '@/components/subjects/TopicRow'

export default function SubjectTopicsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [progressMap, setProgressMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (cancelled || !courseData) return
      setCourse(courseData)

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .order('order_index', { ascending: true })

      if (cancelled) return
      setLessons(lessonData || [])

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_index, step')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)

        if (!cancelled) {
          setProgressMap(new Map((progressData || []).map(p => [p.lesson_index, p.step])))
        }
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded" />
          </div>
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-white/10 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-gray-400">
        Fan topilmadi
      </div>
    )
  }

  const totalTopics = lessons.length
  const doneTopics = [...progressMap.values()].filter(s => s === 'done').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href="/"
        className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5"
      >
        <i className="fa-solid fa-arrow-left"></i> Barcha fanlar
      </Link>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <i className={`fa-solid ${course.icon || 'fa-book-medical'} text-white text-lg`}></i>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{course.title}</h2>
          <p className="text-xs text-gray-400">{doneTopics}/{totalTopics} mavzu tugatildi</p>
        </div>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => (
          <TopicRow
            key={lesson.id}
            slug={slug}
            index={idx}
            title={lesson.title}
            step={progressMap.get(idx) || 0}
            subjectTitle={course.title}
          />
        ))}
      </div>
    </div>
  )
}
