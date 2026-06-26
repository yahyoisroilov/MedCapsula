import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StepFlow } from '@/components/subjects/StepFlow'
import { ArrowLeft } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string; index: string }>
}) {
  const { slug, index: indexStr } = await params
  const index = parseInt(indexStr)
  const supabase = await createClient()

  const { data: course } = await supabase.from('courses').select('*').eq('slug', slug).single()
  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  if (!lessons || index < 0 || index >= lessons.length) notFound()

  const lesson = lessons[index]
  const totalTopics = lessons.length

  const {
    data: { user },
  } = await supabase.auth.getUser()
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
    <div className="relative z-[2] mx-auto max-w-prose px-5 py-10 sm:px-10 sm:py-12">
      <Link
        href={`/subjects/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> {course.title}
      </Link>

      <div className="mb-8 mt-6">
        <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-faint">
          Mavzu {index + 1} / {totalTopics}
        </span>
        <h1 className="mt-2 font-serif text-[clamp(28px,3.4vw,40px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
          {lesson.title}
        </h1>
      </div>

      <StepFlow
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          notesContent: lesson.notes_content,
          quiz: lesson.quiz ?? [],
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
