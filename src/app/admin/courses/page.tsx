'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash, BookOpen, RotateCw } from '@/components/ui/icons'

export default function AdminCoursesPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', icon: 'fa-book-medical' })
  const [creating, setCreating] = useState(false)
  const [checking, setChecking] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { setChecking(false); return }
      setSession(user)
      loadCourses()
      setChecking(false)
    })
  }, [router])

  async function loadCourses() {
    const supabase = createClient()
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: true })
    const withCounts = await Promise.all(
      (data || []).map(async (c) => {
        const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', c.id)
        return { ...c, totalTopics: count || 0 }
      })
    )
    setCourses(withCounts)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.slug) return
    setCreating(true)
    await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, slug: form.slug, icon: form.icon, published: false }),
    })
    setCreating(false)
    setShowCreate(false)
    setForm({ title: '', slug: '', icon: 'fa-book-medical' })
    loadCourses()
  }

  async function handleDelete(course: any) {
    if (!confirm(`"${course.title}" ni o'chirishni tasdiqlaysizmi?`)) return
    setDeleting(course.id)
    await fetch('/api/admin/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: course.id }),
    })
    setDeleting(null)
    loadCourses()
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  if (checking) {
    return <div className="relative z-[2] mx-auto max-w-shell px-5 py-20 text-center text-ink-faint sm:px-10"><RotateCw className="mx-auto h-6 w-6 animate-spin" /></div>
  }

  if (!session) {
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
      <Link href="/admin" className="font-mono text-xs font-semibold text-ink-mute hover:text-brand mb-4 flex items-center gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Admin panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-ink">Fanlarni boshqarish</h1>
          <p className="text-sm text-ink-mute mt-1">Fanlar va mavzularni tahrirlash, video yuklash.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-sm">
          <Plus className="h-4 w-4" /> Yangi fan
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-sand-card border border-[rgba(43,39,34,0.1)] rounded-2xl shadow-lift w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-semibold text-ink mb-4">Yangi fan qo'shish</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-mute mb-1">Fan nomi</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-mute mb-1">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-mute mb-1">Icon (Font Awesome class)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full bg-sand border border-[rgba(43,39,34,0.12)] rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-sand-card border border-[rgba(43,39,34,0.16)] rounded-xl px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white transition-colors">Bekor qilish</button>
                <button type="submit" disabled={creating} className="flex-1 bg-brand text-sand rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50">
                  {creating ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {courses.map((c: any) => (
          <div key={c.id} className="flex items-center gap-4 mc-card p-4 hover:-translate-y-0.5 hover:shadow-lift transition group">
            <Link href={`/admin/courses/${c.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-brand text-sand flex items-center justify-center shadow-btn-sm shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-semibold text-ink">{c.title}</h3>
                  {!c.published && <span className="font-mono text-[10px] font-semibold text-[#9a6a1f] bg-[#f3e6c8] px-2 py-0.5 rounded">Qoralama</span>}
                </div>
                <p className="text-xs text-ink-faint">{c.totalTopics || 0} ta mavzu</p>
              </div>
            </Link>
            <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
              className="p-2 rounded-xl text-ink-faint hover:text-[#b3493d] hover:bg-[#b3493d]/10 opacity-0 group-hover:opacity-100 transition">
              {deleting === c.id ? <RotateCw className="h-5 w-5 animate-spin" /> : <Trash className="h-5 w-5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
