import Link from 'next/link'
import { getSubjects } from '@/lib/subjects'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { Play, FileText, CheckCircle, ArrowRight, Telegram } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

const TELEGRAM = 'https://t.me/Med_Capsula'

const STAGES = [
  { icon: <Play className="h-[18px] w-[18px]" />, tone: 'green' as const, n: '01', title: 'Videodars', text: 'Mavzu mohiyatini qisqa videoda oching.' },
  { icon: <FileText className="h-[18px] w-[18px]" />, tone: 'blue' as const, n: '02', title: 'Konspekt', text: 'Asosiy fikrlar jamlangan tayyor konspekt.' },
  { icon: <CheckCircle className="h-[18px] w-[18px]" />, tone: 'green' as const, n: '03', title: 'Test', text: 'Interaktiv test bilan bilimni mustahkamlang.' },
]

export default async function SubjectsPage() {
  const subjects = await getSubjects()
  const active = subjects.filter(s => s.lessonCount > 0)
  const soon = subjects.filter(s => s.lessonCount === 0)
  const totalLessons = subjects.reduce((a, s) => a + s.lessonCount, 0)

  const stats = [
    { value: subjects.length, label: 'Fanlar' },
    { value: totalLessons, label: 'Mavzular' },
    { value: active.length, label: 'Faol' },
    { value: 3, label: 'Bosqich' },
  ]

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

      {/* Stats band */}
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(43,39,34,0.1)] bg-[rgba(43,39,34,0.08)] sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="bg-sand-card px-5 py-6 text-center sm:text-left">
            <div className="font-serif text-[32px] font-semibold leading-none text-ink">{s.value}</div>
            <div className="mt-1.5 font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-faint">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Subjects grid */}
      {subjects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[rgba(43,39,34,0.2)] p-12 text-center">
          <h3 className="font-serif text-xl text-ink-mute">Hozircha fanlar yo‘q</h3>
          <p className="mt-1.5 text-sm text-ink-faint">Fanlar keyinroq qo‘shiladi.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* How each subject works */}
      <section className="mt-16 rounded-[24px] border border-[rgba(43,39,34,0.1)] bg-sand-deep p-7 sm:p-10">
        <div className="max-w-[40ch]">
          <span className="mc-label">Qanday tuzilgan</span>
          <h2 className="mt-3 font-serif text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.12] tracking-[-0.01em] text-ink">
            Har bir fan — bir xil, sodda tartibda
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STAGES.map(st => (
            <div key={st.n} className="rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-5">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[14px] font-bold ${st.tone === 'green' ? 'text-brand' : 'text-sky'}`}>
                  {st.n}
                </span>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    st.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
                  }`}
                >
                  {st.icon}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-[19px] font-semibold text-ink">{st.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-mute">{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <div className="mt-6 flex flex-col items-start gap-4 rounded-[24px] border border-[rgba(43,39,34,0.1)] bg-sand-card p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h3 className="font-serif text-[22px] font-semibold text-ink">Yangi mavzulardan xabardor bo‘ling</h3>
          <p className="mt-1.5 text-[15px] text-ink-mute">
            Telegram kanalimizda har bir yangilanishni e‘lon qilamiz.
          </p>
        </div>
        <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
          <Telegram className="h-[18px] w-[18px]" /> Telegram kanal <ArrowRight className="h-[18px] w-[18px]" />
        </a>
      </div>
    </div>
  )
}
