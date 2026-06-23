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
  const { error } = await admin.from('lessons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
