'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StepFlow } from '@/components/subjects/StepFlow'

export default function TopicDetailPage() {
  const { slug, index: indexStr } = useParams<{ slug: string; index: string }>()
  const index = parseInt(indexStr)
  const [course, setCourse] = useState<any>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [totalTopics, setTotalTopics] = useState(0)
  const [step, setStep] = useState<string | number>(0)
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

      if (cancelled || !courseData) { setLoading(false); return }
      setCourse(courseData)

      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .order('order_index', { ascending: true })

      if (cancelled || !lessons || index < 0 || index >= lessons.length) { setLoading(false); return }

      const lessonData = lessons[index]
      setLesson(lessonData)
      setTotalTopics(lessons.length)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('step')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .eq('lesson_index', index)
          .maybeSingle()

        if (!cancelled && progress) setStep(progress.step)
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [slug, index])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-gray-400">
        Mavzu topilmadi
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href={`/subjects/${slug}`}
        className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5"
      >
        <i className="fa-solid fa-arrow-left"></i> {course.title}
      </Link>

      <StepFlow
        lesson={lesson}
        subjectTitle={course.title}
        lessonIndex={index}
        totalTopics={totalTopics}
        initialStep={step}
      />
    </div>
  )
}
