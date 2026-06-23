'use client'

import { useState, useRef, useCallback } from 'react'

type ToolbarAction = 'bold' | 'italic' | 'h2' | 'h3' | 'ul' | 'ol' | 'link' | 'hr' | 'quote'

const actions: { key: ToolbarAction; label: string; icon: string }[] = [
  { key: 'bold', label: 'Bold', icon: 'fa-bold' },
  { key: 'italic', label: 'Italic', icon: 'fa-italic' },
  { key: 'h2', label: 'Heading 2', icon: 'fa-heading' },
  { key: 'h3', label: 'Heading 3', icon: 'fa-heading' },
  { key: 'ul', label: 'Bullet list', icon: 'fa-list-ul' },
  { key: 'ol', label: 'Numbered list', icon: 'fa-list-ol' },
  { key: 'quote', label: 'Quote', icon: 'fa-quote-right' },
  { key: 'link', label: 'Link', icon: 'fa-link' },
  { key: 'hr', label: 'Divider', icon: 'fa-minus' },
]

const wrappers: Record<ToolbarAction, [string, string]> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  h2: ['## ', ''],
  h3: ['### ', ''],
  ul: ['\n- ', ''],
  ol: ['\n1. ', ''],
  quote: ['\n> ', ''],
  link: ['[', '](url)'],
  hr: ['\n---\n', ''],
}

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyAction = useCallback((key: ToolbarAction) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)
    const [open, close] = wrappers[key]
    const inserted = selected || (key === 'link' ? 'link text' : '')
    const replacement = open + inserted + close
    const newVal = before + replacement + after
    onChange(newVal)
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = before.length + replacement.length
      ta.setSelectionRange(cursor, cursor)
    })
  }, [value, onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const newVal = value.slice(0, start) + '  ' + value.slice(ta.selectionEnd)
      onChange(newVal)
      requestAnimationFrame(() => ta.setSelectionRange(start + 2, start + 2))
    }
  }

  return (
    <div className="border border-black/5 dark:border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-white/[0.03] border-b border-black/5 dark:border-white/10 flex-wrap">
        {actions.map(a => (
          <button
            key={a.key}
            onClick={() => applyAction(a.key)}
            title={a.label}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white transition-colors text-xs"
          >
            <i className={`fa-solid ${a.icon}`}></i>
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />
        <button
          onClick={() => setPreview(!preview)}
          className={`h-7 px-2 flex items-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
            preview ? 'accent-bg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
        >
          <i className="fa-solid fa-eye"></i> Preview
        </button>
      </div>
      {preview ? (
        <div className="px-4 py-3 text-sm text-gray-900 dark:text-white min-h-[120px] prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={10}
          className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none resize-y font-mono leading-relaxed min-h-[120px]"
          placeholder="Konspekt matnini yozing... **qalin** *kursiv* ## sarlavha"
        />
      )}
    </div>
  )
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return <p className="text-gray-400 text-sm italic">Konspekt mavjud emas</p>

  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-extrabold mt-5 mb-2">$1</h2>')
    .replace(/^\*\*(.+)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\*(.+)\*$/gm, '<em>$1</em>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-emerald-500 pl-3 italic text-gray-500 dark:text-gray-400 my-2">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/^---$/gm, '<hr class="my-3 border-black/10 dark:border-white/10" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-emerald-500 hover:underline">$1</a>')
    .split('\n\n').map(p => p.trim()).filter(Boolean).map(p => {
      if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<blockquote') || p.startsWith('<hr')) return p
      return `<p class="mb-2 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`
    }).join('\n')

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
