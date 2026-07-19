import { createClient } from '@/lib/supabase/server'
import { courses as staticCourses } from '@/lib/data'

export interface SubjectSummary {
  id: string
  slug: string
  title: string
  icon: string | null
  lessonCount: number
  doneCount: number
}

/**
 * Loads published subjects with lesson counts and (when signed in) how many
 * topics the current user has completed. Falls back to the bundled sample data
 * if Supabase is unavailable so pages always render.
 */
export async function getSubjects(): Promise<SubjectSummary[]> {
  try {
    const supabase = await createClient()

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true })

    if (error || !courses) throw error || new Error('no courses')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return await Promise.all(
      courses.map(async course => {
        const { count } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        let doneCount = 0
        if (user) {
          // Only count progress that maps to a topic that still exists —
          // deleting lessons can leave orphaned progress rows behind.
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('lesson_index')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .eq('step', 'done')
            .lt('lesson_index', count || 0)
          doneCount = progress?.length || 0
        }

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          icon: course.icon,
          lessonCount: count || 0,
          doneCount,
        }
      }),
    )
  } catch {
    return staticCourses.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      icon: c.icon,
      lessonCount: c.lessons.length,
      doneCount: 0,
    }))
  }
}
