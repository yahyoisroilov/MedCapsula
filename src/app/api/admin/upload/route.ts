import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Image uploads for Konspekt (lesson notes). Mirrors /api/upload (video) but
// for images, so it reuses the already-configured Cloudinary account.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Faqat rasm fayllari (PNG, JPG, GIF, WEBP, SVG)' },
        { status: 400 },
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Rasm hajmi 5 MB dan oshmasligi kerak' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'medcapsula/konspekt',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, uploaded) => {
          if (error) reject(error)
          else resolve(uploaded as { secure_url: string; public_id: string })
        },
      )
      stream.end(buffer)
    })

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (error: any) {
    if (error?.http_code === 401) {
      return NextResponse.json({ error: 'Cloudinary sozlanmagan' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Yuklashda xatolik' }, { status: 500 })
  }
}
