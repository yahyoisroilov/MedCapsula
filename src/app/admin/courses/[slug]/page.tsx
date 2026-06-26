'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, BookOpen, Check, RotateCw, Info, Upload } from '@/components/ui/icons'

export default function AdminCourseDetailPage({ params }: { params: { slug: string } }) {
  const [session, setSession] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [urlStatus, setUrlStatus] = useState<{[key: number]: 'saving' | 'error' | 'ok'}>({})

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
  }, [])

  useEffect(() => {
    fetch(`/api/courses/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data)
        setLessons(data.lessons || [])
      })
  }, [params.slug])

  async function handleVideoUpload(lessonIndex: number, file: File) {
    setUploading(`lesson-${lessonIndex}`)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')

      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, lessonIndex, videoUrl: data.url }),
      })
      setLessons(prev => prev.map((l, i) =>
        i === lessonIndex ? { ...l, video_url: data.url } : l
      ))
    } catch (e) {
      console.error('Upload failed', e)
    }
    setUploading(null)
  }

  async function handleUrlSave(lessonIndex: number, url: string) {
    setUrlStatus(prev => ({ ...prev, [lessonIndex]: 'saving' }))
    const res = await fetch('/api/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id, lessonIndex, videoUrl: url }),
    })
    if (res.ok) {
      setUrlStatus(prev => ({ ...prev, [lessonIndex]: 'ok' }))
      setLessons(prev => prev.map((l, i) =>
        i === lessonIndex ? { ...l, video_url: url } : l
      ))
    } else {
      setUrlStatus(prev => ({ ...prev, [lessonIndex]: 'error' }))
    }
  }

  if (!session || session.role !== 'admin') {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center sm:px-10">
        <div className="mc-card inline-block p-10">
          <h2 className="font-serif text-xl font-semibold text-[#b3493d]">Ruxsat yo'q</h2>
          <Button href="/" size="sm" className="mt-4">Bosh sahifa</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Fanlar
      </Link>

      {course && (
        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em] text-ink">
              {course.title}
            </h1>
            <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
              {lessons.length} ta mavzu
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {lessons.map((lesson, idx) => (
          <div key={lesson.id} className="mc-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand font-mono text-sm font-bold text-sand">
                {idx + 1}
              </span>
              <h3 className="font-serif text-lg font-semibold text-ink">{lesson.title}</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-soft">Video URL (YouTube embed link)</label>
                <div className="flex gap-2">
                  <input
                    value={lesson.video_url || ''}
                    onChange={e => {
                      const newUrl = e.target.value
                      setLessons(prev => prev.map((l, i) =>
                        i === idx ? { ...l, video_url: newUrl } : l
                      ))
                    }}
                    onBlur={e => handleUrlSave(idx, e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="flex-1 rounded-xl border border-[rgba(43,39,34,0.16)] bg-sand-card px-4 py-2.5 text-sm text-ink placeholder-ink-dim transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                  />
                  {urlStatus[idx] === 'saving' && (
                    <span className="flex items-center text-sky"><RotateCw className="h-4 w-4 animate-spin" /></span>
                  )}
                  {urlStatus[idx] === 'ok' && (
                    <span className="flex items-center text-brand"><Check className="h-4 w-4" /></span>
                  )}
                  {urlStatus[idx] === 'error' && (
                    <span className="flex items-center text-[#b3493d]" title="Saqlashda xatolik"><Info className="h-4 w-4" /></span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-soft">Yoki video fayl yuklash</label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[rgba(43,39,34,0.16)] bg-sand-card px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(43,39,34,0.05)] transition-colors hover:bg-white">
                  <Upload className="h-[18px] w-[18px]" />
                  {uploading === `lesson-${idx}` ? 'Yuklanmoqda...' : 'Fayl tanlash'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploading === `lesson-${idx}`}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleVideoUpload(idx, file)
                    }}
                  />
                </label>
                {lesson.video_url && (
                  <span className="ml-3 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    <Check className="h-4 w-4" /> Video mavjud
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
