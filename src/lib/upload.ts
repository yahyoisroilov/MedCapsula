/**
 * Two-step admin upload used by ImageField, VideoField and MarkdownEditor.
 *
 * 1. Ask our API for a presigned URL (this is where the admin check happens).
 * 2. PUT the bytes straight to Cloudflare R2 — they never touch Vercel, so the
 *    4.5 MB serverless payload limit does not apply.
 *
 * Returns the public URL of the stored file.
 *
 * `onProgress` receives 0-100. It matters for video: a 500 MB upload over a
 * slow connection takes minutes, and without feedback the panel looks frozen.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
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

  // XHR rather than fetch — it's the only way to observe upload progress.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', data.uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Faylni saqlashda xatolik (${xhr.status})`))
    xhr.onerror = () => reject(new Error('Tarmoq xatosi — yuklab boʻlmadi'))
    xhr.onabort = () => reject(new Error('Yuklash bekor qilindi'))

    xhr.send(file)
  })

  return data.publicUrl as string
}
