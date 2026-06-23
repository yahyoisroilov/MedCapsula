'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'

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
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-400"><i className="fa-solid fa-spinner animate-spin text-xl"></i></div>
  }

  if (!session || !course) {
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

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-gray-900 dark:text-white">Fan ma'lumotlari</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={course.published} onChange={e => setCourse({ ...course, published: e.target.checked })} className="rounded" />
              Nashr qilingan
            </label>
            <button onClick={saveCourse} disabled={saving}
              className="accent-bg rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fan nomi</label>
            <input value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Slug</label>
            <input value={course.slug} onChange={e => setCourse({ ...course, slug: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtitle</label>
            <input value={course.subtitle || ''} onChange={e => setCourse({ ...course, subtitle: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Icon (Font Awesome class)</label>
            <input value={course.icon || ''} onChange={e => setCourse({ ...course, icon: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Daraja</label>
            <select value={course.level} onChange={e => setCourse({ ...course, level: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500">
              <option value="beginner">Boshlang'ich</option>
              <option value="intermediate">O'rta</option>
              <option value="advanced">Yuqori</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Kategoriya</label>
            <input value={course.category || ''} onChange={e => setCourse({ ...course, category: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">O'qituvchi</label>
            <input value={course.instructor || ''} onChange={e => setCourse({ ...course, instructor: e.target.value })}
              className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tavsif</label>
          <textarea value={course.description || ''} onChange={e => setCourse({ ...course, description: e.target.value })} rows={3}
            className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-y" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-gray-900 dark:text-white">Mavzular ({lessons.length})</h2>
        <button onClick={addLesson} className="accent-bg rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Yangi mavzu
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
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Test savollari</label>
        <button onClick={addQuestion} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition">
          <i className="fa-solid fa-plus mr-1"></i> Savol qo'shish
        </button>
      </div>
      {questions.length === 0 && (
        <p className="text-xs text-gray-400 mb-2">Hali savollar yo'q. "Savol qo'shish" tugmasini bosing.</p>
      )}
      <div className="space-y-3">
        {questions.map((q: any, qi: number) => (
          <div key={qi} className="border border-black/5 dark:border-white/10 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="h-6 w-6 rounded-lg accent-bg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{qi + 1}</span>
              <div className="flex-1">
                <input value={q.q} onChange={e => updateQuestion(qi, 'q', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 border border-transparent focus:border" />
              </div>
              <button onClick={() => removeQuestion(qi)} className="text-gray-400 hover:text-red-500 text-xs p-1">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="space-y-1 ml-8">
              {q.a.map((a: string, ai: number) => (
                <div key={ai} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correct === ai}
                    onChange={() => updateQuestion(qi, 'correct', ai)} className="shrink-0" />
                  <input value={a} onChange={e => updateAnswer(qi, ai, e.target.value)}
                    className="flex-1 bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 border border-transparent focus:border" />
                  <button onClick={() => removeAnswer(qi, ai)} className="text-gray-400 hover:text-red-500 text-xs p-1">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
              <button onClick={() => addAnswer(qi)} className="text-xs text-gray-400 hover:text-emerald-500">
                <i className="fa-solid fa-plus mr-1"></i> Javob qo'shish
              </button>
            </div>
            <div className="ml-8 mt-2">
              <input value={q.exp || ''} onChange={e => updateQuestion(qi, 'exp', e.target.value)}
                placeholder="Izoh (ixtiyoriy)"
                className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 focus:outline-none focus:border-emerald-500 border border-transparent focus:border" />
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
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg accent-bg flex items-center justify-center text-sm font-bold shrink-0">{index + 1}</span>
          <input value={lesson.title} onChange={e => onChange('title', e.target.value)}
            className="font-bold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-emerald-500 outline-none text-base" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition">
            <i className="fa-solid fa-check mr-1"></i> Saqlash
          </button>
          <button onClick={onDelete} className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition">
            <i className="fa-solid fa-trash mr-1"></i>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tavsif</label>
          <input value={lesson.description || ''} onChange={e => onChange('description', e.target.value)}
            className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Video URL (YouTube embed)</label>
          <input value={lesson.video_url || ''} onChange={e => onChange('video_url', e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Konspekt</label>
          <MarkdownEditor value={lesson.notes_content || ''} onChange={v => onChange('notes_content', v)} />
        </div>
        <QuizEditor value={lesson.quiz || ''} onChange={v => onChange('quiz', v)} />
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Davomiyligi (daqiqa)</label>
          <input type="number" value={lesson.duration || ''} onChange={e => onChange('duration', parseInt(e.target.value) || null)}
            className="w-24 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
        </div>
      </div>
    </div>
  )
}
