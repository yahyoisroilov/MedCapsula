/**
 * Two-step admin upload used by ImageField and MarkdownEditor.
 *
 * 1. Ask our API for a presigned URL (this is where the admin check happens).
 * 2. PUT the bytes straight to Cloudflare R2 — they never touch Vercel, so the
 *    4.5 MB serverless payload limit does not apply.
 *
 * Returns the public URL of the stored file.
 */
export async function uploadFile(file: File): Promise<string> {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik')

  const put = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  if (!put.ok) throw new Error('Faylni saqlashda xatolik')

  return data.publicUrl as string
}
