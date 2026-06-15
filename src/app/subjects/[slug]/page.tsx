import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopicRow } from '@/components/subjects/TopicRow'

export const dynamic = 'force-dynamic'

export default async function SubjectTopicsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  let progresses: { lesson_index: number; step: string }[] = []
  if (user) {
    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_index, step')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
    progresses = data || []
  }

  const progressMap = new Map(progresses.map(p => [p.lesson_index, p.step]))
  const totalTopics = lessons?.length || 0
  const doneTopics = progresses.filter(p => p.step === 'done').length

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
        {(lessons || []).map((lesson, idx) => (
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
