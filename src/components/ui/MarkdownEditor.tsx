'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Bold, Italic, Heading, Highlighter, ListBullet, ListNumbered, Quote,
  LinkIcon, Image, Minus, Eye, Upload, RotateCw, X,
} from '@/components/ui/icons'

type ToolbarAction = 'bold' | 'italic' | 'h2' | 'h3' | 'highlight' | 'ul' | 'ol' | 'link' | 'hr' | 'quote'

// Grouped so the toolbar reads as "text → blocks → insert", easier to scan in the admin panel.
const groups: { label: string; items: { key: ToolbarAction; label: string; Icon: (p: { className?: string }) => React.ReactElement }[] }[] = [
  {
    label: 'Matn',
    items: [
      { key: 'bold', label: 'Qalin (Bold)', Icon: Bold },
      { key: 'italic', label: 'Kursiv (Italic)', Icon: Italic },
      { key: 'highlight', label: 'Ajratish (Highlight)', Icon: Highlighter },
    ],
  },
  {
    label: 'Sarlavha',
    items: [
      { key: 'h2', label: 'Katta sarlavha', Icon: Heading },
      { key: 'h3', label: 'Kichik sarlavha', Icon: Heading },
    ],
  },
  {
    label: 'Bloklar',
    items: [
      { key: 'ul', label: "Belgili ro'yxat", Icon: ListBullet },
      { key: 'ol', label: "Raqamli ro'yxat", Icon: ListNumbered },
      { key: 'quote', label: 'Iqtibos', Icon: Quote },
      { key: 'hr', label: 'Ajratuvchi chiziq', Icon: Minus },
    ],
  },
  {
    label: 'Havola',
    items: [{ key: 'link', label: 'Havola (Link)', Icon: LinkIcon }],
  },
]

const wrappers: Record<ToolbarAction, [string, string]> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  highlight: ['==', '=='],
  h2: ['\n## ', ''],
  h3: ['\n### ', ''],
  ul: ['\n- ', ''],
  ol: ['\n1. ', ''],
  quote: ['\n> ', ''],
  link: ['[', '](https://)'],
  hr: ['\n\n---\n\n', ''],
}

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false)
  const [imgOpen, setImgOpen] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [imgAlt, setImgAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Insert text at the caret (or wrap the current selection).
  const insertAtCursor = useCallback(
    (open: string, close = '', placeholder = '') => {
      const ta = textareaRef.current
      const start = ta ? ta.selectionStart : value.length
      const end = ta ? ta.selectionEnd : value.length
      const before = value.slice(0, start)
      const selected = value.slice(start, end)
      const after = value.slice(end)
      const inner = selected || placeholder
      const replacement = open + inner + close
      onChange(before + replacement + after)
      requestAnimationFrame(() => {
        if (!ta) return
        ta.focus()
        const cursor = before.length + replacement.length
        ta.setSelectionRange(cursor, cursor)
      })
    },
    [value, onChange],
  )

  const applyAction = useCallback(
    (key: ToolbarAction) => {
      const [open, close] = wrappers[key]
      const placeholder = key === 'link' ? 'havola matni' : ''
      insertAtCursor(open, close, placeholder)
    },
    [insertAtCursor],
  )

  // Drop an image into the text wherever the caret is: `![alt](url)` on its own line.
  const insertImage = useCallback(
    (url: string, alt: string) => {
      if (!url.trim()) return
      insertAtCursor(`\n\n![${alt.trim()}](${url.trim()})\n\n`)
      setImgOpen(false)
      setImgUrl('')
      setImgAlt('')
      setUploadErr('')
    },
    [insertAtCursor],
  )

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadErr('')
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik')
        insertImage(data.url, imgAlt || file.name.replace(/\.[^.]+$/, ''))
      } catch (e) {
        setUploadErr(e instanceof Error ? e.message : 'Yuklashda xatolik')
      } finally {
        setUploading(false)
      }
    },
    [imgAlt, insertImage],
  )

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
    <div className="overflow-hidden rounded-xl border border-[rgba(43,39,34,0.12)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-b border-[rgba(43,39,34,0.1)] bg-sand px-2 py-1.5">
        {groups.map((g, gi) => (
          <div key={g.label} className="flex items-center">
            {gi > 0 && <span className="mx-1 h-5 w-px bg-[rgba(43,39,34,0.12)]" />}
            {g.items.map(a => (
              <button
                key={a.key}
                type="button"
                onClick={() => applyAction(a.key)}
                title={a.label}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-[rgba(43,39,34,0.06)] hover:text-ink"
              >
                <a.Icon className={a.key === 'h3' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </button>
            ))}
          </div>
        ))}

        {/* Insert image */}
        <span className="mx-1 h-5 w-px bg-[rgba(43,39,34,0.12)]" />
        <button
          type="button"
          onClick={() => {
            setImgOpen(v => !v)
            setUploadErr('')
          }}
          title="Rasm qo'shish"
          className={`flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors ${
            imgOpen ? 'bg-brand text-sand' : 'text-ink-mute hover:bg-[rgba(43,39,34,0.06)] hover:text-ink'
          }`}
        >
          <Image className="h-4 w-4" /> Rasm
        </button>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors ${
              preview ? 'bg-brand text-sand' : 'text-ink-mute hover:bg-[rgba(43,39,34,0.06)] hover:text-ink'
            }`}
          >
            <Eye className="h-4 w-4" /> {preview ? 'Tahrir' : "Ko'rinish"}
          </button>
        </div>
      </div>

      {/* Image inserter panel */}
      {imgOpen && (
        <div className="border-b border-[rgba(43,39,34,0.1)] bg-sand-deep px-3 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-semibold text-ink-mute">Rasm manzili (URL)</label>
              <input
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertImage(imgUrl, imgAlt)}
                placeholder="https://... yoki rasm yuklang"
                className="w-full rounded-lg border border-[rgba(43,39,34,0.14)] bg-sand-card px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>
            <div className="sm:w-44">
              <label className="mb-1 block text-[11px] font-semibold text-ink-mute">Izoh (ixtiyoriy)</label>
              <input
                value={imgAlt}
                onChange={e => setImgAlt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertImage(imgUrl, imgAlt)}
                placeholder="Rasm tavsifi"
                className="w-full rounded-lg border border-[rgba(43,39,34,0.14)] bg-sand-card px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => insertImage(imgUrl, imgAlt)}
              disabled={!imgUrl.trim()}
              className="btn-sm px-4 py-2 text-xs disabled:opacity-40"
            >
              Matnga qo'shish
            </button>
            <span className="text-[11px] text-ink-faint">yoki</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(43,39,34,0.16)] bg-sand-card px-3 py-2 text-xs font-semibold text-ink-mute transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {uploading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Yuklanmoqda…' : 'Kompyuterdan yuklash'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleUpload(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => setImgOpen(false)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-[rgba(43,39,34,0.06)] hover:text-ink"
              title="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploadErr && <p className="mt-2 text-[12px] text-[#b3493d]">{uploadErr}</p>}
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            Rasm kursordagi joyga qo'shiladi — matnning istalgan qismiga qo'ya olasiz. Maks. 5 MB.
          </p>
        </div>
      )}

      {/* Editor / preview */}
      {preview ? (
        <div className="min-h-[160px] bg-sand-card px-5 py-4">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={12}
          className="min-h-[160px] w-full resize-y bg-sand-card px-4 py-3 font-mono text-sm leading-relaxed text-ink focus:outline-none"
          placeholder={'Konspekt matnini yozing…\n\n## Sarlavha\n**qalin**  *kursiv*  ==ajratilgan==\n- ro‘yxat\n\nRasm: yuqoridagi "Rasm" tugmasi'}
        />
      )}
    </div>
  )
}

/* ─────────────────────────  Renderer  ───────────────────────── */

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Inline formatting: images, links, bold, italic, highlight. Order matters —
// images before links (image syntax contains link syntax).
function inline(raw: string) {
  let s = esc(raw)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt, url) => `<img src="${url}" alt="${alt}" loading="lazy" class="mc-k-inline-img" />`,
  )
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  )
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  s = s.replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
  return s
}

const IMG_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/
const BLOCK_START = /^(#{2,4}\s|[-*]\s|\d+\.\s|>\s?|---+\s*$)/

function renderMarkdown(src: string) {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const t = lines[i].trim()

    if (!t) {
      i++
      continue
    }

    // Block image (own line) → figure with optional caption from alt text.
    const img = t.match(IMG_LINE)
    if (img) {
      const alt = esc(img[1])
      out.push(
        `<figure class="mc-k-figure"><img src="${img[2]}" alt="${alt}" loading="lazy" />` +
          (img[1] ? `<figcaption>${alt}</figcaption>` : '') +
          `</figure>`,
      )
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(t)) {
      out.push('<hr />')
      i++
      continue
    }

    // Headings (##, ###, ####)
    const h = t.match(/^(#{2,4})\s+(.+)$/)
    if (h) {
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(inline(lines[i].trim().replace(/^>\s?/, '')))
        i++
      }
      out.push(`<blockquote>${buf.join('<br/>')}</blockquote>`)
      continue
    }

    // Unordered list
    if (/^[-*]\s+/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        buf.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul>${buf.join('')}</ul>`)
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(t)) {
      const buf: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        buf.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol>${buf.join('')}</ol>`)
      continue
    }

    // Paragraph — gather consecutive plain lines.
    const buf: string[] = []
    while (i < lines.length) {
      const l = lines[i].trim()
      if (!l || BLOCK_START.test(l) || IMG_LINE.test(l)) break
      buf.push(inline(l))
      i++
    }
    if (buf.length) out.push(`<p>${buf.join('<br/>')}</p>`)
  }

  return out.join('\n')
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content || !content.trim()) {
    return <p className="text-sm italic text-ink-faint">Konspekt mavjud emas</p>
  }
  return <div className="mc-konspekt" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
}
