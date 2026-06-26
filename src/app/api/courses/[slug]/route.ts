import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Lesson material (video, konspekt, test) is gated — login required.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  return NextResponse.json({ ...course, lessons: lessons || [] })
}
