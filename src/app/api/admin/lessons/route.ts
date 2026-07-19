import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { data: lessons } = await admin.from('lessons').select('order_index').eq('course_id', body.courseId).order('order_index', { ascending: false }).limit(1)
  const nextIndex = lessons && lessons.length > 0 ? lessons[0].order_index + 1 : 0
  const { data, error } = await admin.from('lessons').insert({
    course_id: body.courseId,
    title: body.title || 'Yangi mavzu',
    description: body.description || '',
    order_index: nextIndex,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { error } = await admin.from('lessons').update({
    title: body.title,
    description: body.description,
    video_url: body.video_url,
    notes_content: body.notes_content,
    quiz: body.quiz,
    duration: body.duration,
  }).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await request.json()
  const admin = createAdminClient()

  // Progress rows are keyed by list position, so removing a lesson must also
  // remove that position's progress and shift the rest down — for every user.
  const { data: lesson } = await admin.from('lessons').select('id, course_id').eq('id', id).single()
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  const { data: all } = await admin
    .from('lessons')
    .select('id')
    .eq('course_id', lesson.course_id)
    .order('order_index', { ascending: true })
  const pos = (all || []).findIndex(l => l.id === id)

  const { error } = await admin.from('lessons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Keep order_index sequential (0..n-1) for the remaining lessons.
  const remaining = (all || []).filter(l => l.id !== id)
  await Promise.all(
    remaining.map((l, i) => admin.from('lessons').update({ order_index: i }).eq('id', l.id)),
  )

  if (pos !== -1) {
    // Drop progress for the removed position, then shift higher rows down by one
    // (ascending order so each update moves into a vacated slot).
    await admin
      .from('lesson_progress')
      .delete()
      .eq('course_id', lesson.course_id)
      .eq('lesson_index', pos)
    const { data: higher } = await admin
      .from('lesson_progress')
      .select('user_id, lesson_index')
      .eq('course_id', lesson.course_id)
      .gt('lesson_index', pos)
      .order('lesson_index', { ascending: true })
    for (const row of higher || []) {
      await admin
        .from('lesson_progress')
        .update({ lesson_index: row.lesson_index - 1 })
        .eq('user_id', row.user_id)
        .eq('course_id', lesson.course_id)
        .eq('lesson_index', row.lesson_index)
    }
  }

  return NextResponse.json({ ok: true })
}
