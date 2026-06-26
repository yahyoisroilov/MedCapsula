import { getSubjects } from '@/lib/subjects'
import { SubjectCard } from '@/components/subjects/SubjectCard'

export const dynamic = 'force-dynamic'

export default async function SubjectsPage() {
  const subjects = await getSubjects()
  const active = subjects.filter(s => s.lessonCount > 0)
  const soon = subjects.filter(s => s.lessonCount === 0)

  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-14 sm:px-10 sm:py-16">
      <header className="max-w-[46ch]">
        <span className="mc-label">Fanlar</span>
        <h1 className="mt-3.5 max-w-[18ch] font-serif text-[clamp(32px,4vw,46px)] font-semibold leading-[1.06] tracking-[-0.02em] text-ink">
          Bilim olishni xohlagan faningizni tanlang
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-ink-mute">
          Har biri videodars, konspekt va testdan iborat. Yangi mavzular muntazam qo‘shilib boriladi.
        </p>
        <div className="mt-5 flex gap-5 font-mono text-[13px] text-ink-faint">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand" /> Faol
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full border-[1.5px] border-[#b6aa93]" /> Tez orada
          </span>
        </div>
      </header>

      {subjects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[rgba(43,39,34,0.2)] p-12 text-center">
          <h3 className="font-serif text-xl text-ink-mute">Hozircha fanlar yo‘q</h3>
          <p className="mt-1.5 text-sm text-ink-faint">Fanlar keyinroq qo‘shiladi.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {active.map((s, i) => (
            <SubjectCard
              key={s.id}
              index={i}
              slug={s.slug}
              title={s.title}
              lessonCount={s.lessonCount}
              doneCount={s.doneCount}
            />
          ))}
          {soon.map((s, i) => (
            <SubjectCard
              key={s.id}
              index={active.length + i}
              slug={s.slug}
              title={s.title}
              lessonCount={s.lessonCount}
              comingSoon
            />
          ))}
        </div>
      )}
    </div>
  )
}
