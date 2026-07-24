'use client'

import { useRef, useState } from 'react'
import { Play, Upload, RotateCw, X, LinkIcon } from '@/components/ui/icons'
import { uploadFile } from '@/lib/upload'
import { normalizeVideoUrl, isYouTubeUrl } from '@/lib/video'

const MAX_VIDEO_MB = 500

/**
 * Video control for a lesson: paste a YouTube link, or upload a video file
 * straight to R2. Stores a single URL in lesson.video_url.
 */
export function VideoField({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function applyUrl() {
    const next = normalizeVideoUrl(url)
    if (!next) return
    onChange(next)
    setUrl('')
    setErr('')
  }

  async function handleUpload(file: File) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setErr(`Video hajmi ${MAX_VIDEO_MB} MB dan oshmasligi kerak`)
      return
    }
    setUploading(true)
    setProgress(0)
    setErr('')
    try {
      const publicUrl = await uploadFile(file, setProgress)
      onChange(publicUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Yuklashda xatolik')
    } finally {
      setUploading(false)
    }
  }

  // ── Has a video → preview + remove ──
  if (value && !uploading) {
    const youtube = isYouTubeUrl(value)
    return (
      <div className="rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand p-2.5">
        <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16/9' }}>
          {youtube ? (
            <iframe className="absolute inset-0 h-full w-full" src={value} allowFullScreen title="Video" />
          ) : (
            <video className="absolute inset-0 h-full w-full" src={value} controls playsInline />
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-tint px-2 py-1 font-mono text-[11px] text-brand">
            {youtube ? <Play className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
            {youtube ? 'YouTube' : 'Yuklangan video'}
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 rounded-lg bg-[#b3493d]/10 px-2.5 py-1.5 text-xs font-semibold text-[#b3493d] transition hover:text-[#9c3e34]"
          >
            <X className="h-3.5 w-3.5" /> Videoni olib tashlash
          </button>
        </div>
        {!youtube && (
          <p className="mt-1.5 break-all font-mono text-[10px] text-ink-faint">{value}</p>
        )}
      </div>
    )
  }

  // ── Uploading → progress bar ──
  if (uploading) {
    return (
      <div className="rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
          <RotateCw className="h-3.5 w-3.5 animate-spin" />
          Yuklanmoqda… {progress}%
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(43,39,34,0.08)]">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-faint">
          Katta fayllar bir necha daqiqa olishi mumkin. Sahifani yopmang.
        </p>
      </div>
    )
  }

  // ── Empty → paste link or upload ──
  return (
    <div className="rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-1.5 rounded-lg border border-[rgba(43,39,34,0.14)] bg-sand-card px-2.5">
          <LinkIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyUrl()
              }
            }}
            placeholder="YouTube havolasi (yoki video URL)"
            className="w-full bg-transparent py-1.5 text-xs text-ink focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={applyUrl}
          disabled={!url.trim()}
          className="btn-sm px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Qo&apos;shish
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(43,39,34,0.16)] bg-sand-card px-2.5 py-1.5 text-xs font-semibold text-ink-mute transition hover:border-brand hover:text-brand"
        >
          <Upload className="h-3.5 w-3.5" /> Video yuklash
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-faint">
        YouTube havolasini istalgan koʻrinishda joylashtiring — avtomatik toʻgʻrilanadi. Yoki MP4/WEBM/MOV
        fayl yuklang (maksimal {MAX_VIDEO_MB} MB).
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleUpload(f)
          e.target.value = ''
        }}
      />
      {err && <p className="mt-1.5 text-[11px] text-[#b3493d]">{err}</p>}
    </div>
  )
}
