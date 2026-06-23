'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [stats, setStats] = useState({ courses: 0, users: 0, activities: 0 })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return
      if (!user) { router.replace('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (cancelled) return
      if (profile?.role !== 'admin') { setSession(null); setChecking(false); return }
      setSession(user)
      const res = await fetch('/api/admin/stats')
      if (!cancelled && res.ok) {
        setStats(await res.json())
      }
      if (!cancelled) setChecking(false)
    })
    return () => { cancelled = true }
  }, [router])

  if (checking) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-400"><i className="fa-solid fa-spinner animate-spin text-xl"></i></div>
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-2xl p-10 inline-block">
          <h2 className="font-bold text-red-500 mb-2">Ruxsat yo'q</h2>
          <p className="text-sm text-gray-400">Faqat adminlar uchun.</p>
          <Link href="/" className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold inline-block mt-4">Bosh sahifa</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Admin panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fanlar va foydalanuvchilarni boshqarish.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl accent-grad flex items-center justify-center shadow-md">
              <i className="fa-solid fa-book text-white"></i>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.courses}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Fanlar</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-md">
              <i className="fa-solid fa-user text-cyan-400"></i>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.users}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Foydalanuvchilar</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-md">
              <i className="fa-solid fa-graduation-cap text-emerald-400"></i>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activities}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Faoliyatlar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-extrabold text-gray-900 dark:text-white mb-4">Tezkor amallar</h2>
          <div className="space-y-3">
            <Link href="/admin/courses" className="accent-bg rounded-xl px-4 py-3 text-sm font-bold block text-center">Fanlarni boshqarish</Link>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-extrabold text-gray-900 dark:text-white mb-4">Umumiy ma'lumot</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Platformada {stats.courses} ta fan, {stats.users} ta foydalanuvchi va {stats.activities} ta faoliyat mavjud.
          </p>
        </div>
      </div>
    </div>
  )
}
