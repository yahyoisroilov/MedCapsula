import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
          <p className="text-xs text-gray-400">{count || 0} ta mavzu · {levelLabel}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{course.description}</p>
      </div>

      <Link
        href={`/subjects/${course.slug}`}
        className="accent-bg rounded-xl px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
      >
        <i className="fa-solid fa-play"></i> O'rganishni boshlash
      </Link>
    </div>
  )
}
