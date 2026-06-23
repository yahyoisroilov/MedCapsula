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

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = await createClient()
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: true })
  const coursesWithCounts = await Promise.all(
    (courses || []).map(async (course) => {
      const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', course.id)
      return { ...course, totalTopics: count || 0 }
    })
  )
  return NextResponse.json(coursesWithCounts)
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('courses').insert({
    title: body.title,
    slug: body.slug,
    subtitle: body.subtitle || null,
    description: body.description || '',
    icon: body.icon || 'fa-book-medical',
    level: body.level || 'beginner',
    category: body.category || null,
    instructor: body.instructor || null,
    published: body.published ?? false,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const admin = createAdminClient()
  const { error } = await admin.from('courses').update({
    title: body.title,
    slug: body.slug,
    subtitle: body.subtitle,
    description: body.description,
    icon: body.icon,
    level: body.level,
    category: body.category,
    instructor: body.instructor,
    published: body.published,
  }).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await request.json()
  const admin = createAdminClient()
  await admin.from('lesson_progress').delete().eq('course_id', id)
  await admin.from('lessons').delete().eq('course_id', id)
  const { error } = await admin.from('courses').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
