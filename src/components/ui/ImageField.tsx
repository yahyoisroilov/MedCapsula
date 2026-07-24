'use client'

import { useRef, useState } from 'react'
import { Image, Upload, RotateCw, X } from '@/components/ui/icons'
import { uploadFile } from '@/lib/upload'

/**
 * Compact single-image control for admin forms (e.g. test questions).
 * Stores one URL: paste a link or upload a file via /api/admin/upload.
 */
export function ImageField({
  value,
  onChange,
  label = 'Rasm',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true)
    setErr('')
    try {
      const publicUrl = await uploadFile(file)
      onChange(publicUrl)
      setOpen(false)
      setUrl('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Yuklashda xatolik')
    } finally {
      setUploading(false)
    }
  }

  // Has an image → show thumbnail + remove.
  if (value) {
    return (
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt=""
          className="h-12 w-16 shrink-0 rounded-lg border border-[rgba(43,39,34,0.12)] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange('')}
          className="inline-flex items-center gap-1 rounded-lg bg-[#b3493d]/10 px-2.5 py-1.5 text-xs font-semibold text-[#b3493d] transition hover:text-[#9c3e34]"
        >
          <X className="h-3.5 w-3.5" /> Rasmni olib tashlash
        </button>
      </div>
    )
  }

  // Collapsed → trigger button.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setErr('')
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[rgba(43,39,34,0.2)] px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:border-brand hover:text-brand"
      >
        <Image className="h-3.5 w-3.5" /> {label}
      </button>
    )
  }

  // Expanded → URL + upload.
  return (
    <div className="rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && url.trim()) {
              onChange(url.trim())
              setOpen(false)
              setUrl('')
            }
          }}
          placeholder="Rasm manzili (URL) yoki fayl yuklang"
          className="min-w-[180px] flex-1 rounded-lg border border-[rgba(43,39,34,0.14)] bg-sand-card px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (url.trim()) {
              onChange(url.trim())
              setOpen(false)
              setUrl('')
            }
          }}
          disabled={!url.trim()}
          className="btn-sm px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Qo'shish
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(43,39,34,0.16)] bg-sand-card px-2.5 py-1.5 text-xs font-semibold text-ink-mute transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {uploading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Yuklanmoqda…' : 'Yuklash'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setErr('')
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-[rgba(43,39,34,0.06)] hover:text-ink"
          title="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) upload(f)
          e.target.value = ''
        }}
      />
      {err && <p className="mt-1.5 text-[11px] text-[#b3493d]">{err}</p>}
    </div>
  )
}
