/**
 * Video URL helpers shared by the admin editor and the student player.
 *
 * Kept out of lib/upload.ts so student pages don't pull in upload code.
 */

/**
 * Normalise any YouTube link into the /embed/ form.
 *
 * The player renders YouTube inside an <iframe>, and YouTube refuses to be
 * framed on watch/shorts/youtu.be URLs — those give a blank player. Applied
 * both on save (admin) and on render, so lessons saved before this existed
 * still play. Non-YouTube URLs are returned untouched.
 */
export function normalizeVideoUrl(raw: string): string {
  const url = (raw || '').trim()
  if (!url) return ''

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ]

  for (const re of patterns) {
    const m = url.match(re)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }

  return url
}

/** True when the URL should be rendered as a YouTube iframe. */
export function isYouTubeUrl(url: string): boolean {
  return Boolean(url) && (url.includes('youtube.com') || url.includes('youtu.be'))
}
