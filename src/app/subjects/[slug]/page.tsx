import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopicRow } from '@/components/subjects/TopicRow'
import { ArrowLeft, ArrowRight, Play, FileText, CheckCircle } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

const STAGES = [
  { label: 'Videodars', tone: 'green', icon: <Play className="h-[15px] w-[15px]" /> },
  { label: 'Konspekt', tone: 'blue', icon: <FileText className="h-[15px] w-[15px]" /> },
  { label: 'Test', tone: 'green', icon: <CheckCircle className="h-[15px] w-[15px]" /> },
] as const

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Boshlang‘ich',
  intermediate: 'O‘rta',
  advanced: 'Yuqori',
}

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

  const isComplete = (s: string | number | undefined) => s === 'done' || Number(s) >= 3
  const doneCount = (lessons || []).filter((_, i) => isComplete(progressMap.get(i))).length
  const startedCount = (lessons || []).filter((_, i) => {
    const s = progressMap.get(i)
    return s !== undefined && (s === 'done' || Number(s) > 0)
  }).length
  const pct = totalTopics ? Math.round((doneCount / totalTopics) * 100) : 0

  const firstIncomplete = (lessons || []).findIndex((_, i) => !isComplete(progressMap.get(i)))
  const startIndex = firstIncomplete === -1 ? 0 : firstIncomplete

  // Position number among subjects, for the "Fan · NN" eyebrow.
  const { data: allCourses } = await supabase
    .from('courses')
    .select('id')
    .eq('published', true)
    .order('created_at', { ascending: true })
  const position = (allCourses?.findIndex(c => c.id === course.id) ?? 0) + 1

  const levelLabel = LEVEL_LABEL[course.level as string] || course.level
  const categoryLabel = course.category
    ? String(course.category).charAt(0).toUpperCase() + String(course.category).slice(1)
    : null

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

      {/* Intro + progress */}
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[22px] border border-[rgba(43,39,34,0.1)] bg-sand-card p-6 shadow-card sm:p-8">
          {course.subtitle && (
            <p className="font-serif text-[19px] italic text-brand">{course.subtitle}</p>
          )}
          {course.description && (
            <p className="mt-3 max-w-[60ch] text-[15.5px] leading-relaxed text-ink-soft">
              {course.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {levelLabel && <span className="pill pill-muted">{levelLabel}</span>}
            {categoryLabel && <span className="pill pill-muted">{categoryLabel}</span>}
            {course.instructor && <span className="pill pill-muted">{course.instructor}</span>}
          </div>
        </div>

        {/* Progress panel */}
        <div className="flex flex-col rounded-[22px] border border-[rgba(43,39,34,0.1)] bg-sand-deep p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="mc-label">Jarayon</span>
            <span className="font-mono text-[13px] text-ink-faint">
              {doneCount}/{totalTopics}
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(43,39,34,0.1)]">
            <div
              className="h-full rounded-full bg-brand transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-mute">
            {totalTopics === 0
              ? 'Mavzular hali qo‘shilmagan.'
              : doneCount === totalTopics
                ? 'Barcha mavzular tugatildi. Ajoyib!'
                : startedCount > 0
                  ? `${startedCount} ta mavzu boshlangan — davom eting.`
                  : 'Birinchi mavzudan boshlang.'}
          </p>
          {totalTopics > 0 && (
            <Link href={`/subjects/${slug}/${startIndex}`} className="btn-primary mt-5">
              {doneCount > 0 ? 'Davom ettirish' : 'Boshlash'}{' '}
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>
      </section>

      {/* Stage explainer */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card px-4 py-3.5"
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                s.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
              }`}
            >
              {s.icon}
            </span>
            <div>
              <span className="font-mono text-[11px] text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-serif text-[16px] font-semibold leading-tight text-ink">{s.label}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Topic list */}
      <div className="mt-10">
        <h2 className="font-serif text-[22px] font-semibold text-ink">Mavzular</h2>
        <div className="mt-3 border-t border-[rgba(43,39,34,0.1)]">
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
    </div>
  )
}
