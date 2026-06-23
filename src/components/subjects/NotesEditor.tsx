'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotesEditorProps {
  courseId: string
}

export function NotesEditor({ courseId }: NotesEditorProps) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('notes').select('content').eq('user_id', user.id).eq('course_id', courseId).maybeSingle()
      setContent(data?.content || '')
      setLoading(false)
    })
  }, [courseId])

  async function handleSave() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notes').upsert({
      user_id: user.id,
      course_id: courseId,
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id' })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={12}
        placeholder="Bu fan bo'yicha qaydlaringizni shu yerga yozing..."
        className="w-full bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-y leading-relaxed"
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleSave}
          className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2"
        >
          <i className="fa-solid fa-floppy-disk"></i> Saqlash
        </button>
        <span
          className="text-xs font-bold text-emerald-500 transition-opacity"
          style={{ opacity: saved ? 1 : 0 }}
        >
          Saqlandi ✓
        </span>
      </div>
    </div>
  )
}
