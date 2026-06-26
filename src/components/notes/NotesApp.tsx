'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Trash, Info, Check } from '@/components/ui/icons'

type BlockType = 'h' | 'p' | 'bullet' | 'todo' | 'callout'
interface Block {
  id: string
  type: BlockType
  text: string
  checked?: boolean
}
interface Note {
  id: string
  title: string
  subject: string
  blocks: Block[]
  updated_at?: string
}

const BLOCK_MENU: { type: BlockType; label: string }[] = [
  { type: 'h', label: 'Sarlavha' },
  { type: 'p', label: 'Matn' },
  { type: 'bullet', label: "Ro'yxat" },
  { type: 'todo', label: 'Vazifa' },
  { type: 'callout', label: 'Eslatma' },
]

const PLACEHOLDERS: Record<BlockType, string> = {
  h: 'Sarlavha',
  p: 'Yozishni boshlang…',
  bullet: "Ro'yxat bandi",
  todo: 'Vazifa',
  callout: 'Eslatma',
}

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `b_${Math.round(performance.now() * 1000)}_${Math.floor(Math.random() * 1e6)}`
}

function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('uz', { day: 'numeric', month: 'short' })
}

export function NotesApp({ subjects }: { subjects: string[] }) {
  const subjectOptions = ['Umumiy', ...subjects]

  const toneFor = useCallback(
    (subject: string): { dot: string; pill: string } => {
      if (!subject || subject === 'Umumiy')
        return { dot: 'bg-[#b6aa93]', pill: 'pill-muted' }
      const i = subjects.indexOf(subject)
      const green = { dot: 'bg-brand', pill: 'pill-green' }
      const blue = { dot: 'bg-sky', pill: 'pill-blue' }
      return i < 0 ? green : i % 2 === 0 ? green : blue
    },
    [subjects],
  )

  const [notes, setNotes] = useState<Note[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [filter, setFilter] = useState<string>('all')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const active = notes.find(n => n.id === activeId) || null

  useEffect(() => {
    fetch('/api/notes')
      .then(r => (r.ok ? r.json() : { notes: [] }))
      .then(d => {
        const list: Note[] = (d.notes || []).map((n: Note) => ({
          ...n,
          blocks: Array.isArray(n.blocks) ? n.blocks : [],
        }))
        setNotes(list)
        setActiveId(list[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persist = useCallback((note: Note) => {
    setStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    }, 600)
  }, [])

  const mutate = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes(prev => {
        const next = prev.map(n => (n.id === id ? { ...n, ...patch } : n))
        const updated = next.find(n => n.id === id)
        if (updated) persist(updated)
        return next
      })
    },
    [persist],
  )

  async function createNote() {
    const draft = {
      title: '',
      subject: 'Umumiy',
      blocks: [{ id: uid(), type: 'p' as BlockType, text: '' }],
    }
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (!res.ok) return
    const { note } = await res.json()
    const normalized: Note = { ...note, blocks: Array.isArray(note.blocks) ? note.blocks : draft.blocks }
    setNotes(prev => [normalized, ...prev])
    setActiveId(normalized.id)
    setFilter('all') // make sure the new note is visible regardless of the active filter
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  // Block helpers operate on the active note
  function setBlocks(updater: (blocks: Block[]) => Block[]) {
    if (!active) return
    mutate(active.id, { blocks: updater(active.blocks) })
  }
  const addBlock = (type: BlockType) =>
    setBlocks(b => [...b, { id: uid(), type, text: '', checked: false }])
  const updateBlockText = (id: string, text: string) =>
    setBlocks(b => b.map(x => (x.id === id ? { ...x, text } : x)))
  const toggleTodo = (id: string) =>
    setBlocks(b => b.map(x => (x.id === id ? { ...x, checked: !x.checked } : x)))
  const removeBlock = (id: string) => setBlocks(b => b.filter(x => x.id !== id))

  // ── Sidebar: filter / group notes by subject tag ──
  const norm = (s: string) => s || 'Umumiy'
  const counts = new Map<string, number>()
  for (const n of notes) counts.set(norm(n.subject), (counts.get(norm(n.subject)) || 0) + 1)
  // Order: Umumiy + known subjects (in their order), then any leftover tags.
  const orderedSubjects = [
    ...subjectOptions.filter(s => counts.has(s)),
    ...Array.from(counts.keys()).filter(s => !subjectOptions.includes(s)),
  ]
  const effectiveFilter = filter !== 'all' && counts.has(filter) ? filter : 'all'
  const visibleNotes =
    effectiveFilter === 'all' ? notes : notes.filter(n => norm(n.subject) === effectiveFilter)
  const grouped = effectiveFilter === 'all' && orderedSubjects.length > 1
  const showChips = orderedSubjects.length > 1

  const renderNote = (n: Note) => {
    const tone = toneFor(n.subject)
    return (
      <button
        key={n.id}
        onClick={() => setActiveId(n.id)}
        className={cn(
          'group relative flex w-full flex-col gap-2 rounded-[11px] border p-3 text-left transition-colors',
          n.id === activeId
            ? 'border-[rgba(43,39,34,0.12)] bg-sand-card'
            : 'border-transparent hover:bg-sand-card/60',
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('h-[7px] w-[7px] shrink-0 rounded-full', tone.dot)} />
          <span className="truncate font-serif text-[16px] font-semibold text-ink">
            {n.title || 'Sarlavhasiz qayd'}
          </span>
        </div>
        <div className="flex items-center justify-between pl-[15px]">
          <span className={cn('pill !px-2 !py-0.5 !text-[11.5px]', tone.pill)}>
            {n.subject || 'Umumiy'}
          </span>
          <span className="font-mono text-[10.5px] text-ink-faint">{fmtDate(n.updated_at)}</span>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={e => {
            e.stopPropagation()
            deleteNote(n.id)
          }}
          className="absolute right-2.5 top-2.5 text-[#8a8170] opacity-0 transition-opacity hover:text-[#b3493d] group-hover:opacity-60"
        >
          <Trash className="h-4 w-4" />
        </span>
      </button>
    )
  }

  return (
    <div className="relative z-[2] mx-auto grid max-w-[1280px] grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="border-b border-[rgba(43,39,34,0.12)] px-5 py-6 md:sticky md:top-[69px] md:h-[calc(100vh-69px)] md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-brand-soft">Qaydlar</div>
        <h2 className="mt-1 font-serif text-[21px] font-semibold text-ink">Mening qaydlarim</h2>

        <button
          onClick={createNote}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[11px] bg-brand px-3.5 py-2.5 text-[14.5px] font-semibold text-sand shadow-btn-sm hover:bg-brand-dark"
        >
          <Plus className="h-[17px] w-[17px]" /> Yangi qayd
        </button>

        {showChips && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <FilterChip
              label="Barchasi"
              count={notes.length}
              active={effectiveFilter === 'all'}
              onClick={() => setFilter('all')}
            />
            {orderedSubjects.map(s => (
              <FilterChip
                key={s}
                label={s}
                count={counts.get(s) || 0}
                active={effectiveFilter === s}
                onClick={() => setFilter(s)}
                dot={toneFor(s).dot}
              />
            ))}
          </div>
        )}

        <div className="mt-4">
          {grouped ? (
            <div className="space-y-4">
              {orderedSubjects.map(s => (
                <div key={s}>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
                      {s}
                    </span>
                    <span className="font-mono text-[10.5px] text-ink-dim">{counts.get(s)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {notes.filter(n => norm(n.subject) === s).map(renderNote)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">{visibleNotes.map(renderNote)}</div>
          )}
          {!loading && notes.length === 0 && (
            <p className="px-1 pt-2 text-[13px] text-ink-faint">Hali qayd yo‘q.</p>
          )}
        </div>
      </aside>

      {/* Editor */}
      <section className="px-5 py-8 sm:px-10">
        {!active ? (
          <div className="px-5 py-28 text-center">
            <h3 className="font-serif text-[22px] text-ink-mute">Hali qayd yo‘q</h3>
            <p className="mx-auto mt-2 max-w-[34ch] text-[15px] text-ink-faint">
              «Yangi qayd» tugmasi orqali birinchi qaydingizni yarating.
            </p>
            <button onClick={createNote} className="btn-sm mx-auto mt-5">
              <Plus className="h-[17px] w-[17px]" /> Yangi qayd
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-prose">
            {/* meta bar */}
            <div className="flex items-center justify-between gap-3">
              <select
                value={active.subject || 'Umumiy'}
                onChange={e => mutate(active.id, { subject: e.target.value })}
                className={cn(
                  'cursor-pointer rounded-full border px-3 py-1 text-[13px] font-semibold outline-none',
                  toneFor(active.subject).pill,
                )}
              >
                {subjectOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-ink-faint">
                  {status === 'saving' ? 'Saqlanmoqda…' : status === 'saved' ? 'Saqlandi ✓' : fmtDate(active.updated_at)}
                </span>
                <button
                  onClick={() => deleteNote(active.id)}
                  className="inline-flex items-center gap-1.5 text-[13px] text-ink-faint hover:text-[#b3493d]"
                >
                  <Trash className="h-4 w-4" /> O‘chirish
                </button>
              </div>
            </div>

            {/* title */}
            <div
              key={`title-${active.id}`}
              contentEditable
              suppressContentEditableWarning
              data-ph="Sarlavhasiz qayd"
              onBlur={e => mutate(active.id, { title: e.currentTarget.textContent || '' })}
              className="mt-6 font-serif text-[38px] font-semibold leading-tight tracking-[-0.02em] text-ink outline-none"
            >
              {active.title}
            </div>

            {/* blocks */}
            <div className="mt-6 space-y-1">
              {active.blocks.map(block => (
                <BlockRow
                  key={`${active.id}-${block.id}`}
                  block={block}
                  onCommit={text => updateBlockText(block.id, text)}
                  onToggle={() => toggleTodo(block.id)}
                  onRemove={() => removeBlock(block.id)}
                />
              ))}
            </div>

            {/* add block */}
            <AddBlock onAdd={addBlock} />
          </div>
        )}
      </section>
    </div>
  )
}

function BlockRow({
  block,
  onCommit,
  onToggle,
  onRemove,
}: {
  block: Block
  onCommit: (text: string) => void
  onToggle: () => void
  onRemove: () => void
}) {
  const editable = (extra: string) => (
    <div
      contentEditable
      suppressContentEditableWarning
      data-ph={PLACEHOLDERS[block.type]}
      onBlur={e => onCommit(e.currentTarget.textContent || '')}
      className={cn('flex-1 outline-none', extra)}
    >
      {block.text}
    </div>
  )

  return (
    <div className="group relative flex items-start gap-2.5">
      {/* hover delete */}
      <button
        onClick={onRemove}
        className="absolute -left-7 top-1.5 text-ink-faint opacity-0 transition-opacity hover:text-[#b3493d] group-hover:opacity-50"
        title="O‘chirish"
        tabIndex={-1}
      >
        <Trash className="h-3.5 w-3.5" />
      </button>

      {block.type === 'h' && editable('font-serif text-[23px] font-semibold text-ink py-2.5')}
      {block.type === 'p' && editable('text-[16.5px] leading-[1.7] text-ink-soft py-1')}

      {block.type === 'bullet' && (
        <div className="flex w-full items-start gap-2.5 py-0.5">
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          {editable('text-[16.5px] leading-[1.65] text-ink-soft py-0.5')}
        </div>
      )}

      {block.type === 'todo' && (
        <div className="flex w-full items-start gap-2.5 py-0.5">
          <button
            onClick={onToggle}
            className={cn(
              'mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-[1.6px] transition-colors',
              block.checked ? 'border-brand bg-brand text-sand' : 'border-[#b6aa93] bg-transparent',
            )}
          >
            {block.checked && <Check className="h-3 w-3" strokeWidth={2.6} />}
          </button>
          {editable(
            cn(
              'text-[16.5px] leading-[1.65] py-0.5',
              block.checked ? 'text-ink-faint line-through' : 'text-ink-soft',
            ),
          )}
        </div>
      )}

      {block.type === 'callout' && (
        <div className="my-2 flex w-full items-start gap-3 rounded-xl border border-brand-line bg-brand-tint px-4 py-3.5">
          <Info className="mt-0.5 h-[19px] w-[19px] shrink-0 text-brand" />
          {editable('text-[15.5px] leading-[1.6] text-[#2c5e46]')}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  dot?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors',
        active
          ? 'border-brand bg-brand text-sand'
          : 'border-[rgba(43,39,34,0.13)] bg-sand-card text-ink-mute hover:border-brand-line',
      )}
    >
      {dot && !active && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      <span className="max-w-[9ch] truncate">{label}</span>
      <span className={cn('font-mono text-[10.5px]', active ? 'text-sand/80' : 'text-ink-faint')}>
        {count}
      </span>
    </button>
  )
}

function AddBlock({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 py-1.5 text-[14.5px] text-ink-faint hover:text-ink-mute"
      >
        <Plus className="h-4 w-4" /> Blok qo‘shish
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-44 overflow-hidden rounded-xl border border-[rgba(43,39,34,0.12)] bg-sand-card py-1 shadow-lift">
          {BLOCK_MENU.map(b => (
            <button
              key={b.type}
              onClick={() => {
                onAdd(b.type)
                setOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-[14.5px] text-ink-soft hover:bg-sand"
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
