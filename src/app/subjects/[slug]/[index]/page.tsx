import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StepFlow } from '@/components/subjects/StepFlow'

export const dynamic = 'force-dynamic'

export default async function TopicDetailPage({ params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index: indexStr } = await params
  const index = parseInt(indexStr)
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

  if (!lessons || index < 0 || index >= lessons.length) notFound()

  const lesson = lessons[index]
  const totalTopics = lessons.length

  const { data: { user } } = await supabase.auth.getUser()
  let step: string | number = 0

  if (user) {
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('step')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('lesson_index', index)
      .maybeSingle()

    if (progress) step = progress.step
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href={`/subjects/${slug}`}
        className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5"
      >
        <i className="fa-solid fa-arrow-left"></i> {course.title}
      </Link>

      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{lesson.title}</h2>
      <p className="text-xs text-gray-400 mb-5">Mavzu {index + 1} / {totalTopics}</p>

      <StepFlow
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          notesContent: lesson.notes_content,
          quiz: lesson.quiz || '[]',
          duration: lesson.duration,
        }}
        courseId={course.id}
        slug={slug}
        lessonIndex={index}
        initialStep={step}
      />
    </div>
  )
}
