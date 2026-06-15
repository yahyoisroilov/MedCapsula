import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  let query = supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user.id)

  if (courseId) {
    query = query.eq('course_id', courseId)
  }

  const { data } = await query
  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId, lessonIndex, step } = await request.json()

  const { error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_index: lessonIndex,
      step,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,course_id,lesson_index',
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
