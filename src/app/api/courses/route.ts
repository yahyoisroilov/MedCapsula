import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const coursesWithCounts = await Promise.all(
    (courses || []).map(async (course) => {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)

      return { ...course, totalTopics: count || 0 }
    })
  )

  return NextResponse.json(coursesWithCounts)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courseId, lessonIndex, videoUrl } = await request.json()

  // Get the lesson at the given index
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
    .range(lessonIndex, lessonIndex)

  if (!lessons || lessons.length === 0) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('lessons')
    .update({ video_url: videoUrl })
    .eq('id', lessons[0].id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
