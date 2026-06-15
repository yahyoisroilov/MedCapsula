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

  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  }

  const { data } = await supabase
    .from('notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  return NextResponse.json({ content: data?.content || '' })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId, content } = await request.json()

  const { error } = await supabase
    .from('notes')
    .upsert({
      user_id: user.id,
      course_id: courseId,
      content,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,course_id',
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
