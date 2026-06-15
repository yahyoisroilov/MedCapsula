import { createClient } from '@/lib/supabase/server'
import { SubjectCard } from '@/components/subjects/SubjectCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: true })

  const coursesWithCounts = await Promise.all(
    (courses || []).map(async (course) => {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_index')
        .eq('course_id', course.id)
        .eq('step', 'done')

      return {
        slug: course.slug,
        title: course.title,
        icon: course.icon || 'fa-book-medical',
        totalTopics: count || 0,
        doneTopics: progress?.length || 0,
      }
    })
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Fanlar</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fanni tanlang va har bir mavzuni 3 bosqichda o&apos;rganing: Video &rarr; O&apos;qish &rarr; Test.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesWithCounts.map(s => (
          <SubjectCard key={s.slug} {...s} />
        ))}
      </div>
      {coursesWithCounts.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <i className="fa-solid fa-book text-gray-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-700 dark:text-gray-200">Hozircha fanlar yo&apos;q</h3>
          <p className="text-xs text-gray-400 mt-1">Fanlar keyinroq qo&apos;shiladi.</p>
        </div>
      )}
    </div>
  )
}
