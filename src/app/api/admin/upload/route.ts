import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'lesson-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

// Image uploads for Konspekt and test questions. Uses Supabase Storage
// (already configured for this project) — the public bucket is created on
// first use, so no manual setup is needed.
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

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')
  if (!(file instanceof File)) {
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

  const admin = createAdminClient()

  // Ensure the public bucket exists (idempotent; ignore "already exists" races).
  const { data: bucket } = await admin.storage.getBucket(BUCKET)
  if (!bucket) {
    await admin.storage
      .createBucket(BUCKET, { public: true, fileSizeLimit: MAX_SIZE, allowedMimeTypes: ALLOWED_TYPES })
      .catch(() => {})
  }

  const safeName =
    (file.name || 'image')
      .toLowerCase()
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image'
  const path = `konspekt/${safeName}-${randomUUID().slice(0, 8)}.${EXT[file.type] || 'png'}`

  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true })
  if (error) {
    return NextResponse.json({ error: `Yuklashda xatolik: ${error.message}` }, { status: 500 })
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
