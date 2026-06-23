'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    const supabase = createClient()
    await supabase.from('courses').insert({ title: form.title, slug: form.slug, icon: form.icon, published: false })
    setCreating(false)
    setShowCreate(false)
    setForm({ title: '', slug: '', icon: 'fa-book-medical' })
    loadCourses()
  }

  async function handleDelete(course: any) {
    if (!confirm(`"${course.title}" ni o'chirishni tasdiqlaysizmi?`)) return
    setDeleting(course.id)
    const supabase = createClient()
    await supabase.from('lesson_progress').delete().eq('course_id', course.id)
    await supabase.from('lessons').delete().eq('course_id', course.id)
    await supabase.from('courses').delete().eq('id', course.id)
    setDeleting(null)
    loadCourses()
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  if (checking) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-400"><i className="fa-solid fa-spinner animate-spin text-xl"></i></div>
  }

  if (!session) {
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
      <Link href="/admin" className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 mb-4 flex items-center gap-1.5">
        <i className="fa-solid fa-arrow-left"></i> Admin panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Fanlarni boshqarish</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fanlar va mavzularni tahrirlash, video yuklash.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="accent-bg rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Yangi fan
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="glass rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-extrabold text-gray-900 dark:text-white mb-4">Yangi fan qo'shish</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fan nomi</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Icon (Font Awesome class)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-200 dark:bg-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-white">Bekor qilish</button>
                <button type="submit" disabled={creating} className="flex-1 accent-bg rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50">
                  {creating ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {courses.map((c: any) => (
          <div key={c.id} className="flex items-center gap-4 glass rounded-2xl p-4 hover:-translate-y-0.5 transition group">
            <Link href={`/admin/courses/${c.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <i className={`fa-solid ${c.icon || 'fa-book-medical'} text-white text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 dark:text-white">{c.title}</h3>
                  {!c.published && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Qoralama</span>}
                </div>
                <p className="text-xs text-gray-400">{c.totalTopics || 0} ta mavzu</p>
              </div>
            </Link>
            <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition">
              <i className={`fa-solid ${deleting === c.id ? 'fa-spinner animate-spin' : 'fa-trash'}`}></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
