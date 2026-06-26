import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopicRow } from '@/components/subjects/TopicRow'
import { ArrowLeft } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

const STAGES = [
  { label: 'Videodars', tone: 'green' },
  { label: 'Konspekt', tone: 'blue' },
  { label: 'Test', tone: 'green' },
] as const

export default async function SubjectTopicsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase.from('courses').select('*').eq('slug', slug).single()
  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Position number among subjects, for the "Fan · NN" eyebrow.
  const { data: allCourses } = await supabase
    .from('courses')
    .select('id')
    .eq('published', true)
    .order('created_at', { ascending: true })
  const position = (allCourses?.findIndex(c => c.id === course.id) ?? 0) + 1

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-10 sm:px-10 sm:py-12">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Barcha fanlar
      </Link>

      <header className="mt-8">
        <span className="mc-label">Fan · {String(position).padStart(2, '0')}</span>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-[clamp(34px,4.4vw,52px)] font-semibold leading-[1.04] tracking-[-0.02em] text-ink">
            {course.title}
          </h1>
          <span className="pill pill-green text-[14px]">{totalTopics} mavzu</span>
        </div>
      </header>

      {/* Process legend */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-faint">Jarayon</span>
        {STAGES.map(s => (
          <span key={s.label} className="flex items-center gap-2 text-[13px] text-ink-mute">
            <span className={`h-2 w-2 rounded-full ${s.tone === 'green' ? 'bg-brand' : 'bg-sky'}`} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Topic list */}
      <div className="mt-6 border-t border-[rgba(43,39,34,0.10)]">
        {(lessons || []).map((lesson, idx) => (
          <TopicRow
            key={lesson.id}
            slug={slug}
            index={idx}
            title={lesson.title}
            step={progressMap.get(idx) ?? 0}
          />
        ))}
        {totalTopics === 0 && (
          <div className="py-16 text-center">
            <h3 className="font-serif text-xl text-ink-mute">Mavzular hali qo‘shilmagan</h3>
            <p className="mt-1.5 text-sm text-ink-faint">Bu fan uchun mavzular keyinroq qo‘shiladi.</p>
          </div>
        )}
      </div>
    </div>
  )
}
