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
  const admin = createAdminClient()
  const [coursesRes, usersRes, progressRes] = await Promise.all([
    admin.from('courses').select('id'),
    admin.from('profiles').select('id'),
    admin.from('lesson_progress').select('id'),
  ])
  return NextResponse.json({
    courses: coursesRes.data?.length || 0,
    users: usersRes.data?.length || 0,
    activities: progressRes.data?.length || 0,
  })
}
