import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { getR2Client, isR2Configured, publicUrlFor, R2_BUCKET } from '@/lib/r2'

// Uploads go straight from the browser to Cloudflare R2. This route only
// checks that the caller is an admin and hands back a short-lived presigned
// PUT URL — the file bytes never pass through Vercel, so the 4.5 MB function
// payload limit does not apply.

const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500 MB

const URL_TTL_SECONDS = 60 * 5 // presigned URL is valid for 5 minutes

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

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: 'Fayl saqlash sozlanmagan (R2 environment variables)' },
      { status: 500 },
    )
  }

  const body = await request.json().catch(() => null)
  const contentType = typeof body?.contentType === 'string' ? body.contentType : ''
  const size = Number(body?.size)

  const isImage = contentType in IMAGE_TYPES
  const isVideo = contentType in VIDEO_TYPES
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Faqat rasm (PNG, JPG, GIF, WEBP, SVG) yoki video (MP4, WEBM, MOV)' },
      { status: 400 },
    )
  }

  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: 'Fayl hajmi notoʻgʻri' }, { status: 400 })
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024))
    return NextResponse.json(
      { error: `Fayl hajmi ${mb} MB dan oshmasligi kerak` },
      { status: 400 },
    )
  }

  const ext = isImage ? IMAGE_TYPES[contentType] : VIDEO_TYPES[contentType]
  const key = `${isImage ? 'images' : 'videos'}/${randomUUID()}.${ext}`

  // ContentType and ContentLength are signed, so the browser's PUT must match
  // exactly — a leaked URL cannot be reused to upload something bigger.
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  })

  try {
    const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: URL_TTL_SECONDS })
    return NextResponse.json({ uploadUrl, publicUrl: publicUrlFor(key), key })
  } catch {
    return NextResponse.json({ error: 'Yuklash havolasini olishda xatolik' }, { status: 500 })
  }
}
