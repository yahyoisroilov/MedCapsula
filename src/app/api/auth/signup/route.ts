import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Barcha maydonlarni to‘ldiring' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'student' },
    })

    if (error) {
      const msg = /already|exists/i.test(error.message)
        ? 'Bu email bilan hisob allaqachon mavjud'
        : 'Ro‘yxatdan o‘tishda xatolik. Qayta urinib ko‘ring.'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Serverda xatolik. Qayta urinib ko‘ring.' }, { status: 500 })
  }
}
