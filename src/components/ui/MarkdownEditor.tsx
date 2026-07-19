'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bold, Italic, Heading, Highlighter, ListBullet, ListNumbered, Quote,
  LinkIcon, Image, Minus, Upload, RotateCw, X,
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

/* ─────────────────────  DOM → markdown (background sync)  ───────────────────── */

const BLOCK_TAGS = new Set(['H2', 'H3', 'H4', 'P', 'DIV', 'UL', 'OL', 'BLOCKQUOTE', 'FIGURE', 'HR'])

// Serialize inline content; <br> becomes a newline within the block.
function inlineMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/ /g, ' ')
  }
  if (!(node instanceof HTMLElement)) return ''
  const kids = Array.from(node.childNodes).map(inlineMd).join('')
  switch (node.tagName) {
    case 'STRONG':
    case 'B':
      return kids.trim() ? `**${kids}**` : kids
    case 'EM':
    case 'I':
      return kids.trim() ? `*${kids}*` : kids
    case 'MARK':
      return kids.trim() ? `==${kids}==` : kids
    case 'A':
      return `[${kids || node.getAttribute('href') || ''}](${node.getAttribute('href') || ''})`
    case 'IMG':
      return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`
    case 'BR':
      return '\n'
    default:
      return kids
  }
}

function listMd(el: HTMLElement, ordered: boolean): string | null {
  const items = Array.from(el.children)
    .filter(c => c.tagName === 'LI')
    .map(li => inlineMd(li).replace(/\n/g, ' ').trim())
    .filter(Boolean)
  if (!items.length) return null
  return items.map((t, i) => (ordered ? `${i + 1}. ${t}` : `- ${t}`)).join('\n')
}

function blockMd(node: Node): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.textContent || '').replace(/ /g, ' ').trim()
    return t || null
  }
  if (!(node instanceof HTMLElement)) return null

  switch (node.tagName) {
    case 'H2':
      return withPrefix('## ', node)
    case 'H3':
      return withPrefix('### ', node)
    case 'H4':
      return withPrefix('#### ', node)
    case 'HR':
      return '---'
    case 'UL':
      return listMd(node, false)
    case 'OL':
      return listMd(node, true)
    case 'BLOCKQUOTE': {
      const text = inlineMd(node).trim()
      if (!text) return null
      return text
        .split('\n')
        .map(l => `> ${l.trim()}`)
        .join('\n')
    }
    case 'FIGURE': {
      const img = node.querySelector('img')
      if (!img) return null
      const cap = node.querySelector('figcaption')?.textContent?.trim() || img.getAttribute('alt') || ''
      return `![${cap}](${img.getAttribute('src') || ''})`
    }
    case 'IMG':
      return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`
    case 'P':
    case 'DIV': {
      // Browsers sometimes nest blocks inside divs — recurse in that case.
      if (Array.from(node.children).some(c => BLOCK_TAGS.has(c.tagName))) {
        return domToMarkdown(node) || null
      }
      const text = inlineMd(node).replace(/\n{2,}/g, '\n').trim()
      return text || null
    }
    default: {
      const text = inlineMd(node).trim()
      return text || null
    }
  }
}

function withPrefix(prefix: string, el: HTMLElement): string | null {
  const text = inlineMd(el).replace(/\n/g, ' ').trim()
  return text ? prefix + text : null
}

function domToMarkdown(root: HTMLElement): string {
  return Array.from(root.childNodes)
    .map(blockMd)
    .filter((b): b is string => Boolean(b))
    .join('\n\n')
}

/* ─────────────────────────────  WYSIWYG editor  ───────────────────────────── */

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [imgOpen, setImgOpen] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [imgAlt, setImgAlt] = useState('')
  const [imgPos, setImgPos] = useState<'top' | 'cursor' | 'end'>('cursor')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // Last markdown we emitted — lets us tell our own onChange echo apart from
  // an external value change (which must re-render the DOM).
  const emitted = useRef<string | null>(null)
  // Last block the caret was in, so image insert works after focus moves to the panel.
  const lastBlock = useRef<HTMLElement | null>(null)

  // Editor DOM → markdown, emitted upward. The visible document IS the editor;
  // markdown is derived in the background.
  const sync = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const md = domToMarkdown(el)
    el.dataset.empty = md.trim() ? 'false' : 'true'
    emitted.current = md
    onChange(md)
  }, [onChange])

  // External markdown → editor DOM (initial mount, or value changed outside us).
  useEffect(() => {
    const el = editorRef.current
    if (!el || emitted.current === value) return
    el.innerHTML = renderMarkdown(value || '')
    el.dataset.empty = value && value.trim() ? 'false' : 'true'
    emitted.current = value
  }, [value])

  useEffect(() => {
    // Prefer semantic tags (<b>/<i>) and <p> paragraphs from execCommand.
    try {
      document.execCommand('styleWithCSS', false, 'false')
      document.execCommand('defaultParagraphSeparator', false, 'p')
    } catch {
      /* older browsers */
    }
  }, [])

  const rememberBlock = useCallback(() => {
    const el = editorRef.current
    const sel = window.getSelection()
    if (!el || !sel?.anchorNode || !el.contains(sel.anchorNode)) return
    let n: Node | null = sel.anchorNode
    while (n && n.parentNode !== el) n = n.parentNode
    lastBlock.current = n instanceof HTMLElement ? n : null
  }, [])

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      editorRef.current?.focus()
      document.execCommand(cmd, false, arg)
      sync()
    },
    [sync],
  )

  const applyAction = useCallback(
    (key: ToolbarAction) => {
      switch (key) {
        case 'bold':
          return exec('bold')
        case 'italic':
          return exec('italic')
        case 'h2':
        case 'h3': {
          // Toggle: pressing again turns the heading back into a paragraph.
          const cur = document.queryCommandValue('formatBlock').toLowerCase()
          return exec('formatBlock', cur === key ? 'p' : key)
        }
        case 'quote': {
          const cur = document.queryCommandValue('formatBlock').toLowerCase()
          return exec('formatBlock', cur === 'blockquote' ? 'p' : 'blockquote')
        }
        case 'ul':
          return exec('insertUnorderedList')
        case 'ol':
          return exec('insertOrderedList')
        case 'hr':
          return exec('insertHorizontalRule')
        case 'highlight': {
          const sel = window.getSelection()
          const anchor = sel?.anchorNode
          const markEl =
            anchor instanceof Element
              ? anchor.closest('mark')
              : anchor?.parentElement?.closest('mark')
          if (markEl && editorRef.current?.contains(markEl)) {
            // Toggle off: unwrap the existing highlight.
            markEl.replaceWith(...Array.from(markEl.childNodes))
            sync()
            return
          }
          const text = sel?.toString()
          if (!text) return
          return exec('insertHTML', `<mark>${escHtml(text)}</mark>`)
        }
        case 'link': {
          const url = window.prompt('Havola manzili (URL):', 'https://')
          if (!url || url === 'https://') return
          const sel = window.getSelection()
          if (!sel || sel.isCollapsed) {
            return exec('insertHTML', `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(url)}</a>`)
          }
          return exec('createLink', url)
        }
      }
    },
    [exec, sync],
  )

  // Insert an image figure directly into the document at the chosen position.
  const insertImage = useCallback(
    (url: string, alt: string) => {
      const el = editorRef.current
      if (!el || !url.trim()) return
      const fig = document.createElement('figure')
      fig.className = 'mc-k-figure'
      const img = document.createElement('img')
      img.src = url.trim()
      img.alt = alt.trim()
      img.loading = 'lazy'
      fig.appendChild(img)
      if (alt.trim()) {
        const cap = document.createElement('figcaption')
        cap.textContent = alt.trim()
        fig.appendChild(cap)
      }

      if (imgPos === 'top') {
        el.prepend(fig)
      } else if (imgPos === 'end') {
        el.append(fig)
      } else {
        const target = lastBlock.current
        if (target && el.contains(target)) target.after(fig)
        else el.append(fig)
      }

      sync()
      setImgOpen(false)
      setImgUrl('')
      setImgAlt('')
      setUploadErr('')
    },
    [imgPos, sync],
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
                onMouseDown={e => e.preventDefault()} /* keep the editor selection */
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
          onMouseDown={e => e.preventDefault()}
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

          {/* Where the image goes */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold text-ink-mute">Joylashuv:</span>
            {(
              [
                ['top', 'Matn boshiga'],
                ['cursor', 'Kursor joyiga'],
                ['end', 'Matn oxiriga'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setImgPos(key)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  imgPos === key
                    ? 'bg-brand text-sand'
                    : 'border border-[rgba(43,39,34,0.14)] bg-sand-card text-ink-mute hover:border-brand hover:text-brand'
                }`}
              >
                {label}
              </button>
            ))}
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
            &quot;Kursor joyiga&quot; — matn ichida kursor turgan joydan keyin qo&apos;shadi. Maks. 5 MB.
          </p>
        </div>
      )}

      {/* The document itself is editable — styled exactly like the student page. */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder="Konspekt matnini yozing…"
        onInput={sync}
        onKeyUp={rememberBlock}
        onMouseUp={rememberBlock}
        onBlur={rememberBlock}
        onPaste={e => {
          // Paste as plain text so outside formatting can't corrupt the document.
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
          sync()
        }}
        className="mc-konspekt mc-wysiwyg min-h-[320px] w-full bg-sand-card px-5 py-4 focus:outline-none"
      />
    </div>
  )
}

/* ─────────────────────────  markdown → HTML renderer  ───────────────────────── */

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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

export function renderMarkdown(src: string) {
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
