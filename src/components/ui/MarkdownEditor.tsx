'use client'

import { useState, useRef, useEffect, useCallback, useReducer } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import TipImage from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { contentToHtml } from '@/components/ui/KonspektContent'
import { uploadFile } from '@/lib/upload'
import {
  Bold, Italic, Heading, Highlighter, ListBullet, ListNumbered, Quote,
  LinkIcon, Image as ImageIcon, Minus, Upload, RotateCw, X,
} from '@/components/ui/icons'

export { MarkdownRenderer } from '@/components/ui/KonspektContent'

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

// One format button, shared by the fixed toolbar and the floating (bubble) one.
// Defined at module scope (NOT inside MarkdownEditor) so its component identity
// is stable — otherwise React remounts every button on each editor transaction,
// which detaches them mid-click and the styles never apply.
function FormatButton({
  editor,
  onApply,
  a,
  dark = false,
}: {
  editor: Editor | null
  onApply: (key: ToolbarAction) => void
  a: (typeof groups)[number]['items'][number]
  dark?: boolean
}) {
  const active = editor ? isActionActive(editor, a.key) : false
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()} /* keep the editor selection */
      onClick={() => onApply(a.key)}
      title={a.label}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
        dark
          ? active
            ? 'bg-brand text-sand'
            : 'text-sand/80 hover:bg-white/10 hover:text-sand'
          : active
            ? 'bg-brand-tint text-brand'
            : 'text-ink-mute hover:bg-[rgba(43,39,34,0.06)] hover:text-ink'
      }`}
    >
      <a.Icon className={a.key === 'h3' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </button>
  )
}

function isActionActive(editor: Editor, key: ToolbarAction): boolean {
  switch (key) {
    case 'bold':
      return editor.isActive('bold')
    case 'italic':
      return editor.isActive('italic')
    case 'highlight':
      return editor.isActive('highlight')
    case 'h2':
      return editor.isActive('heading', { level: 2 })
    case 'h3':
      return editor.isActive('heading', { level: 3 })
    case 'ul':
      return editor.isActive('bulletList')
    case 'ol':
      return editor.isActive('orderedList')
    case 'quote':
      return editor.isActive('blockquote')
    case 'link':
      return editor.isActive('link')
    default:
      return false
  }
}

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [imgOpen, setImgOpen] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [imgAlt, setImgAlt] = useState('')
  const [imgPos, setImgPos] = useState<'top' | 'cursor' | 'end'>('cursor')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  // Last HTML we emitted — distinguishes our own onChange echo from a real
  // external value change (which must reset the editor content).
  const emitted = useRef<string | null>(value)
  // Re-render on selection/content changes so toolbar active states track the caret.
  const [, bump] = useReducer((x: number) => x + 1, 0)

  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR safety
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TipImage,
      Highlight,
      Placeholder.configure({ placeholder: 'Konspekt matnini yozing…' }),
    ],
    editorProps: {
      attributes: {
        class: 'mc-konspekt mc-wysiwyg min-h-[320px] w-full bg-sand-card px-5 py-4 focus:outline-none',
      },
    },
    content: contentToHtml(value),
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? '' : e.getHTML()
      emitted.current = html
      onChange(html)
      bump() // refresh toolbar active states after a mark/content change
    },
    // Only bump on selection changes — NOT on every transaction. The BubbleMenu
    // dispatches position/meta transactions, and bumping on those creates an
    // infinite render loop ("Maximum update depth exceeded").
    onSelectionUpdate: () => bump(),
  })

  // External value change (e.g. lesson reloaded) → reset editor content.
  useEffect(() => {
    if (!editor || emitted.current === value) return
    editor.commands.setContent(contentToHtml(value), { emitUpdate: false })
    emitted.current = value
  }, [value, editor])

  const applyAction = useCallback(
    (key: ToolbarAction) => {
      if (!editor) return
      const chain = editor.chain().focus()
      switch (key) {
        case 'bold':
          return chain.toggleBold().run()
        case 'italic':
          return chain.toggleItalic().run()
        case 'highlight':
          return chain.toggleHighlight().run()
        case 'h2':
          return chain.toggleHeading({ level: 2 }).run()
        case 'h3':
          return chain.toggleHeading({ level: 3 }).run()
        case 'ul':
          return chain.toggleBulletList().run()
        case 'ol':
          return chain.toggleOrderedList().run()
        case 'quote':
          return chain.toggleBlockquote().run()
        case 'hr':
          return chain.setHorizontalRule().run()
        case 'link': {
          const prev = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('Havola manzili (URL):', prev || 'https://')
          if (url === null) return
          if (!url.trim() || url === 'https://') {
            return chain.extendMarkRange('link').unsetLink().run()
          }
          if (editor.state.selection.empty && !editor.isActive('link')) {
            return chain
              .insertContent(`<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${url.trim()}</a> `)
              .run()
          }
          return chain.extendMarkRange('link').setLink({ href: url.trim() }).run()
        }
      }
    },
    [editor],
  )

  // Insert an image at the chosen position: top, caret, or end of the document.
  const insertImage = useCallback(
    (url: string, alt: string) => {
      if (!editor || !url.trim()) return
      const node = { type: 'image', attrs: { src: url.trim(), alt: alt.trim() || null } }
      if (imgPos === 'top') {
        editor.chain().focus().insertContentAt(0, node).run()
      } else if (imgPos === 'end') {
        editor.chain().focus().insertContentAt(editor.state.doc.content.size, node).run()
      } else {
        editor.chain().focus().insertContent(node).run()
      }
      setImgOpen(false)
      setImgUrl('')
      setImgAlt('')
      setUploadErr('')
    },
    [editor, imgPos],
  )

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadErr('')
      try {
        const publicUrl = await uploadFile(file)
        insertImage(publicUrl, imgAlt || file.name.replace(/\.[^.]+$/, ''))
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
      {/* Floating toolbar — appears over a text selection, like Microsoft Word. */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top', offset: 8 }}
          shouldShow={({ editor: e, state }) =>
            e.isEditable && !state.selection.empty && !e.isActive('image')
          }
          className="flex items-center gap-0.5 rounded-xl border border-black/10 bg-ink px-1 py-1 shadow-[0_8px_24px_rgba(43,39,34,0.28)]"
        >
          {groups.map((g, gi) => (
            <div key={g.label} className="flex items-center">
              {gi > 0 && <span className="mx-0.5 h-5 w-px bg-white/15" />}
              {g.items.map(a => (
                <FormatButton key={a.key} editor={editor} onApply={applyAction} a={a} dark />
              ))}
            </div>
          ))}
          <span className="mx-0.5 h-5 w-px bg-white/15" />
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              setImgPos('cursor')
              fileRef.current?.click()
            }}
            title="Rasm qo'shish (kursor joyiga)"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sand/80 transition-colors hover:bg-white/10 hover:text-sand"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-b border-[rgba(43,39,34,0.1)] bg-sand px-2 py-1.5">
        {groups.map((g, gi) => (
          <div key={g.label} className="flex items-center">
            {gi > 0 && <span className="mx-1 h-5 w-px bg-[rgba(43,39,34,0.12)]" />}
            {g.items.map(a => (
              <FormatButton key={a.key} editor={editor} onApply={applyAction} a={a} />
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
          <ImageIcon className="h-4 w-4" /> Rasm
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
            &quot;Kursor joyiga&quot; — matn ichida kursor turgan joyga qo&apos;shadi. Maks. 5 MB.
          </p>
        </div>
      )}

      {/* The document itself — a real ProseMirror editor, styled like the student page. */}
      <EditorContent editor={editor} />
    </div>
  )
}
