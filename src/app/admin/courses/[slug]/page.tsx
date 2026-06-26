'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { ArrowLeft, Plus, Check, Trash, X, RotateCw } from '@/components/ui/icons'

export default function AdminCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return
      if (!user) { router.replace('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (cancelled) return
      if (profile?.role !== 'admin') { setChecking(false); return }
      setSession(user)
      loadCourse()
      setChecking(false)
    })
    return () => { cancelled = true }
  }, [slug, router])

  async function loadCourse() {
    const supabase = createClient()
    const { data: courseData } = await supabase.from('courses').select('*').eq('slug', slug).single()
    if (!courseData) return
    setCourse(courseData)
    const { data: lessonData } = await supabase.from('lessons').select('*').eq('course_id', courseData.id).order('order_index', { ascending: true })
    setLessons(lessonData || [])
  }

  async function saveCourse() {
    if (!course) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Saqlashda xatolik')
      setSaving(false)
      return
    }
    if (course.slug !== slug) {
      router.replace('/admin/courses/' + course.slug)
    }
    setSaving(false)
  }

  async function addLesson() {
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setLessons([...lessons, data])
    } else {
      setError('Mavzu qo\'shishda xatolik')
    }
  }

  async function deleteLesson(lesson: any) {
    if (!confirm(`"${lesson.title}" ni o'chirishni tasdiqlaysizmi?`)) return
    const res = await fetch('/api/admin/lessons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lesson.id }),
    })
    if (res.ok) {
      setLessons(lessons.filter(l => l.id !== lesson.id))
    } else {
      setError('Mavzuni o\'chirishda xatolik')
    }
  }

  function updateLesson(index: number, field: string, value: any) {
    setLessons(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  async function saveLesson(lesson: any) {
    setError('')
    const res = await fetch('/api/admin/lessons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Saqlashda xatolik')
    }
  }

  if (checking) {
    return <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center text-ink-faint sm:px-10"><RotateCw className="mx-auto h-6 w-6 animate-spin" /></div>
  }

  if (!session || !course) {
    return (
      <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center sm:px-10">
        <div className="mx-auto inline-block rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-10 shadow-card">
          <h2 className="font-serif text-lg font-semibold text-[#b3493d] mb-2">Ruxsat yo'q</h2>
          <Link href="/" className="btn-sm mx-auto mt-4">Bosh sahifa</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <Link href="/admin/courses" className="font-mono text-xs font-semibold text-ink-mute hover:text-brand mb-4 flex items-center gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Fanlar
      </Link>

      <div className="mc-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-ink">Fan ma'lumotlari</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-mute cursor-pointer">
              <input type="checkbox" checked={course.published} onChange={e => setCourse({ ...course, published: e.target.checked })} className="rounded accent-brand" />
              Nashr qilingan
            </label>
            <button onClick={saveCourse} disabled={saving}
              className="bg-brand text-sand rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Fan nomi</label>
            <input value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Slug</label>
            <input value={course.slug} onChange={e => setCourse({ ...course, slug: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Subtitle</label>
            <input value={course.subtitle || ''} onChange={e => setCourse({ ...course, subtitle: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Icon (Font Awesome class)</label>
            <input value={course.icon || ''} onChange={e => setCourse({ ...course, icon: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Daraja</label>
            <select value={course.level} onChange={e => setCourse({ ...course, level: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand">
              <option value="beginner">Boshlang'ich</option>
              <option value="intermediate">O'rta</option>
              <option value="advanced">Yuqori</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">Kategoriya</label>
            <input value={course.category || ''} onChange={e => setCourse({ ...course, category: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mute mb-1">O'qituvchi</label>
            <input value={course.instructor || ''} onChange={e => setCourse({ ...course, instructor: e.target.value })}
              className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-ink-mute mb-1">Tavsif</label>
          <textarea value={course.description || ''} onChange={e => setCourse({ ...course, description: e.target.value })} rows={3}
            className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand resize-y" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold text-ink">Mavzular ({lessons.length})</h2>
        <button onClick={addLesson} className="btn-sm">
          <Plus className="h-4 w-4" /> Yangi mavzu
        </button>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, idx) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            index={idx}
            onChange={(field, value) => updateLesson(idx, field, value)}
            onSave={() => saveLesson(lesson)}
            onDelete={() => deleteLesson(lesson)}
          />
        ))}
      </div>
    </div>
  )
}

function QuizEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const questions = useMemo(() => {
    try { return JSON.parse(value || '[]') as any[] } catch { return [] }
  }, [value])

  function addQuestion() {
    const qs = [...questions, { q: 'Yangi savol', a: ['Javob A', 'Javob B', 'Javob C', 'Javob D'], correct: 0, exp: '' }]
    onChange(JSON.stringify(qs))
  }

  function removeQuestion(idx: number) {
    const qs = questions.filter((_: any, i: number) => i !== idx)
    onChange(JSON.stringify(qs))
  }

  function updateQuestion(idx: number, field: string, val: any) {
    const qs = questions.map((q: any, i: number) => i === idx ? { ...q, [field]: val } : q)
    onChange(JSON.stringify(qs))
  }

  function updateAnswer(qIdx: number, aIdx: number, val: string) {
    const qs = questions.map((q: any, i: number) =>
      i === qIdx ? { ...q, a: q.a.map((a: string, j: number) => j === aIdx ? val : a) } : q
    )
    onChange(JSON.stringify(qs))
  }

  function addAnswer(idx: number) {
    const qs = questions.map((q: any, i: number) =>
      i === idx ? { ...q, a: [...q.a, ''] } : q
    )
    onChange(JSON.stringify(qs))
  }

  function removeAnswer(qIdx: number, aIdx: number) {
    const qs = questions.map((q: any, i: number) =>
      i === qIdx ? { ...q, a: q.a.filter((_: any, j: number) => j !== aIdx), correct: q.correct === aIdx ? 0 : q.correct } : q
    )
    onChange(JSON.stringify(qs))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-ink-mute">Test savollari</label>
        <button onClick={addQuestion} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark bg-brand-tint px-3 py-1.5 rounded-lg transition">
          <Plus className="h-3.5 w-3.5" /> Savol qo'shish
        </button>
      </div>
      {questions.length === 0 && (
        <p className="text-xs text-ink-faint mb-2">Hali savollar yo'q. "Savol qo'shish" tugmasini bosing.</p>
      )}
      <div className="space-y-3">
        {questions.map((q: any, qi: number) => (
          <div key={qi} className="border border-[rgba(43,39,34,0.12)] rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="h-6 w-6 rounded-lg bg-brand text-sand flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{qi + 1}</span>
              <div className="flex-1">
                <input value={q.q} onChange={e => updateQuestion(qi, 'q', e.target.value)}
                  className="w-full bg-sand rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none border border-transparent focus:border focus:border-brand" />
              </div>
              <button onClick={() => removeQuestion(qi)} className="text-ink-faint hover:text-[#b3493d] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 ml-8">
              {q.a.map((a: string, ai: number) => (
                <div key={ai} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correct === ai}
                    onChange={() => updateQuestion(qi, 'correct', ai)} className="shrink-0 accent-brand" />
                  <input value={a} onChange={e => updateAnswer(qi, ai, e.target.value)}
                    className="flex-1 bg-sand rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none border border-transparent focus:border focus:border-brand" />
                  <button onClick={() => removeAnswer(qi, ai)} className="text-ink-faint hover:text-[#b3493d] p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer(qi)} className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-brand">
                <Plus className="h-3.5 w-3.5" /> Javob qo'shish
              </button>
            </div>
            <div className="ml-8 mt-2">
              <input value={q.exp || ''} onChange={e => updateQuestion(qi, 'exp', e.target.value)}
                placeholder="Izoh (ixtiyoriy)"
                className="w-full bg-sand rounded-lg px-3 py-1.5 text-xs text-ink-mute focus:outline-none border border-transparent focus:border focus:border-brand" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LessonEditor({ lesson, index, onChange, onSave, onDelete }: {
  lesson: any; index: number; onChange: (field: string, value: any) => void; onSave: () => void; onDelete: () => void
}) {
  return (
    <div className="mc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg bg-brand text-sand flex items-center justify-center text-sm font-bold shrink-0">{index + 1}</span>
          <input value={lesson.title} onChange={e => onChange('title', e.target.value)}
            className="font-serif font-semibold text-ink bg-transparent border-b border-transparent hover:border-[rgba(43,39,34,0.2)] focus:border-brand outline-none text-base" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark bg-brand-tint px-3 py-1.5 rounded-lg transition">
            <Check className="h-3.5 w-3.5" /> Saqlash
          </button>
          <button onClick={onDelete} className="inline-flex items-center text-xs font-semibold text-[#b3493d] hover:text-[#9c3e34] bg-[#b3493d]/10 px-3 py-1.5 rounded-lg transition">
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-ink-mute mb-1">Tavsif</label>
          <input value={lesson.description || ''} onChange={e => onChange('description', e.target.value)}
            className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-mute mb-1">Video URL (YouTube embed)</label>
          <input value={lesson.video_url || ''} onChange={e => onChange('video_url', e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-mute mb-1">Konspekt</label>
          <MarkdownEditor value={lesson.notes_content || ''} onChange={v => onChange('notes_content', v)} />
        </div>
        <QuizEditor value={lesson.quiz || ''} onChange={v => onChange('quiz', v)} />
        <div>
          <label className="block text-xs font-semibold text-ink-mute mb-1">Davomiyligi (daqiqa)</label>
          <input type="number" value={lesson.duration || ''} onChange={e => onChange('duration', parseInt(e.target.value) || null)}
            className="w-24 bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand" />
        </div>
      </div>
    </div>
  )
}
