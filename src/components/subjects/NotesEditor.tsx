'use client'

import { useState, useEffect } from 'react'

interface NotesEditorProps {
  courseId: string
}

export function NotesEditor({ courseId }: NotesEditorProps) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/notes?courseId=${courseId}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [courseId])

  async function handleSave() {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, content }),
    })
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
