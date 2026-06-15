'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-2xl p-10 inline-block">
          <h2 className="font-bold text-red-500 mb-2">Ruxsat yo'q</h2>
          <Link href="/" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">Bosh sahifa</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/admin/courses" className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5">
        <i className="fa-solid fa-arrow-left"></i> Fanlar
      </Link>

      {course && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <i className={`fa-solid ${course.icon || 'fa-book-medical'} text-white text-lg`}></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{course.title}</h1>
            <p className="text-xs text-gray-400">{lessons.length} ta mavzu</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {lessons.map((lesson, idx) => (
          <div key={lesson.id} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-8 w-8 rounded-lg accent-bg flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</span>
              <h3 className="font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
            </div>

            <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Video URL (YouTube embed link)</label>
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
                        className="flex-1 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      {urlStatus[idx] === 'saving' && (
                        <span className="text-xs text-blue-500 flex items-center"><i className="fa-solid fa-spinner animate-spin"></i></span>
                      )}
                      {urlStatus[idx] === 'ok' && (
                        <span className="text-xs text-emerald-500 flex items-center"><i className="fa-solid fa-check"></i></span>
                      )}
                      {urlStatus[idx] === 'error' && (
                        <span className="text-xs text-red-500 flex items-center" title="Saqlashda xatolik"><i className="fa-solid fa-triangle-exclamation"></i></span>
                      )}
                    </div>
                  </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Yoki video fayl yuklash</label>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-white/10 text-sm font-bold text-gray-800 dark:text-white cursor-pointer hover:opacity-90">
                  <i className="fa-solid fa-upload"></i>
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
                  <span className="ml-3 text-xs text-emerald-500">&#10003; Video mavjud</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
