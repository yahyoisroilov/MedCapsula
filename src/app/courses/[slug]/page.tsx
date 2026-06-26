import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, BookOpen, Play } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  const { count } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', course.id)

  const levelLabel = course.level === 'beginner' ? "Boshlang'ich" : course.level === 'intermediate' ? "O'rta" : 'Yuqori'

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Barcha fanlar
      </Link>

      <div className="mt-8 flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em] text-ink">
            {course.title}
          </h1>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
            {count || 0} ta mavzu · {levelLabel}
          </p>
        </div>
      </div>

      <div className="mc-card mt-6 p-6">
        <p className="text-[15.5px] leading-relaxed text-ink-soft">{course.description}</p>
      </div>

      <Link href={`/subjects/${course.slug}`} className="btn-primary mt-6">
        <Play className="h-[18px] w-[18px]" /> O'rganishni boshlash
      </Link>
    </div>
  )
}
