import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email va parolni kiriting' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const msg = /invalid login credentials/i.test(error.message)
        ? 'Email yoki parol noto‘g‘ri'
        : /not confirmed/i.test(error.message)
          ? 'Email tasdiqlanmagan'
          : 'Kirishda xatolik. Qayta urinib ko‘ring.'
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || '',
        role: profile?.role || 'student',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Serverda xatolik. Qayta urinib ko‘ring.' }, { status: 500 })
  }
}
