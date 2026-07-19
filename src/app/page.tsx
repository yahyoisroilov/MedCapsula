import Link from 'next/link'
import { getSubjects } from '@/lib/subjects'
import {
  ArrowRight,
  Telegram,
  Play,
  FileText,
  CheckCircle,
  Check,
  ChevronRight,
  Globe,
  TrendingUp,
  Clock,
  Layers,
  Target,
  GraduationCap,
  Plus,
} from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// Uzbek number words for headline counts ("Yetti fan, oltita mavzu").
const NUM_WORD = ['nol', 'bir', 'ikki', 'uch', 'to‘rt', 'besh', 'olti', 'yetti', 'sakkiz', 'to‘qqiz', 'o‘n']
const NUM_TA = ['nolta', 'bitta', 'ikkita', 'uchta', 'to‘rtta', 'beshta', 'oltita', 'yettita', 'sakkizta', 'to‘qqizta', 'o‘nta']

function numWord(n: number) {
  if (n <= 10) return NUM_WORD[n]
  if (n <= 19) return `o‘n ${NUM_WORD[n - 10]}`
  return String(n)
}

function numTa(n: number) {
  if (n <= 10) return NUM_TA[n]
  if (n <= 19) return `o‘n ${NUM_TA[n - 10]}`
  return `${n} ta`
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const TELEGRAM = 'https://t.me/Med_Capsula'

/* Floating capsule used in the hero. Pure CSS float animation. */
function Capsule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-[26px] border border-white/20 ${className}`}>
      <div
        className="relative w-full"
        style={{
          height: '50%',
          borderRadius: '75px 75px 26px 26px',
          background: 'linear-gradient(150deg,#3d805f,#2F6B4F 60%,#27593f)',
        }}
      >
        <span className="absolute left-[20%] top-[6%] h-[62%] w-[20px] rounded-full bg-white/25" />
      </div>
      <div
        className="w-full"
        style={{
          height: '50%',
          borderRadius: '26px 26px 75px 75px',
          background: 'linear-gradient(150deg,#9ccaea,#7FB8DC 55%,#69a6cf)',
          boxShadow: '0 -2px 6px rgba(43,39,34,0.12)',
        }}
      />
    </div>
  )
}

function StepLabel({
  n,
  title,
  icon,
  tone,
  className = '',
}: {
  n: string
  title: string
  icon: React.ReactNode
  tone: 'green' | 'blue'
  className?: string
}) {
  return (
    <div
      className={`w-[160px] rounded-xl border border-[rgba(43,39,34,0.13)] bg-sand-card p-3.5 shadow-card ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-[30px] w-[30px] place-items-center rounded-lg ${
            tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
          }`}
        >
          {icon}
        </span>
        <div>
          <div className="font-mono text-[12px] text-ink-faint">{n}</div>
          <div className="font-serif text-[17px] font-semibold leading-tight text-ink">{title}</div>
        </div>
      </div>
    </div>
  )
}

export default async function LandingPage() {
  const subjects = await getSubjects()
  const active = subjects.filter(s => s.lessonCount > 0)
  const soon = subjects.filter(s => s.lessonCount === 0)
  const totalLessons = subjects.reduce((a, s) => a + s.lessonCount, 0)

  const stats = [
    { value: subjects.length || 7, label: 'Fanlar' },
    { value: totalLessons || 6, label: 'Mavzular' },
    { value: 3, label: 'Bosqich' },
  ]

  const steps = [
    {
      n: '01',
      title: 'Videodars',
      tone: 'green' as const,
      icon: <Play className="h-6 w-6" />,
      text: 'Mavzu mohiyatini qisqa va tushunarli videodars orqali oching.',
      featured: false,
    },
    {
      n: '02',
      title: 'Konspekt',
      tone: 'blue' as const,
      icon: <FileText className="h-6 w-6" />,
      text: 'Asosiy fikrlar jamlangan tayyor konspekt bilan mustahkamlang.',
      featured: true,
    },
    {
      n: '03',
      title: 'Test',
      tone: 'green' as const,
      icon: <CheckCircle className="h-6 w-6" />,
      text: 'Interaktiv test orqali bilimingizni sinab ko‘ring.',
      featured: false,
    },
  ]

  const benefits = [
    { icon: <Globe className="h-[22px] w-[22px]" />, tone: 'green', title: 'Har qayerdan kirish', text: 'Telefon, planshet yoki kompyuter — istalgan qurilmadan.' },
    { icon: <TrendingUp className="h-[22px] w-[22px]" />, tone: 'blue', title: 'Progress kuzatuvi', text: 'Qaysi mavzularni o‘zlashtirganingizni kuzating.' },
    { icon: <Clock className="h-[22px] w-[22px]" />, tone: 'green', title: 'Vaqtni tejang', text: 'Tartiblangan material bilan tezroq tayyorlaning.' },
    { icon: <Layers className="h-[22px] w-[22px]" />, tone: 'blue', title: '3 xil format', text: 'Video, matn va test — har xil o‘rganish uslubi uchun.' },
    { icon: <Target className="h-[22px] w-[22px]" />, tone: 'green', title: 'Interaktiv testlar', text: 'Har bir mavzudan keyin o‘zingizni sinab ko‘ring.' },
    { icon: <GraduationCap className="h-[22px] w-[22px]" />, tone: 'blue', title: 'Talabalar uchun', text: 'Talabalar tomonidan, talabalar ehtiyojiga mos.' },
  ]

  const team = [
    {
      initial: 'Y',
      name: 'Yahyobek',
      role: 'Tibbiyot talabasi & Dasturchi',
      tone: 'green' as const,
      channel: 'https://t.me/isrlv_blog',
      handle: '@isrlv_blog',
    },
    {
      initial: 'A',
      name: 'Azizbek',
      role: 'Tibbiyot talabasi',
      tone: 'blue' as const,
      channel: 'https://t.me/asu_journey',
      handle: '@asu_journey',
    },
  ]

  const faqs = [
    {
      q: 'MedCapsula bepulmi?',
      a: 'Ha. Hozircha barcha mavzular — videodars, konspekt va testlar — to‘liq bepul. Ro‘yxatdan o‘tib, darrov boshlashingiz mumkin.',
    },
    {
      q: 'Darslar qaysi tilda?',
      a: 'Barcha materiallar o‘zbek tilida. Tibbiyot atamalari talabalarga tushunarli tarzda izohlanadi.',
    },
    {
      q: 'Qanday qurilmada ishlaydi?',
      a: 'Telefon, planshet va kompyuter — brauzer orqali istalgan qurilmadan kirasiz. Alohida dastur o‘rnatish shart emas.',
    },
    {
      q: 'Har bir mavzu qanday tuzilgan?',
      a: 'Uch bosqichda: avval qisqa videodars, so‘ng asosiy fikrlar jamlangan konspekt, oxirida bilimni mustahkamlovchi interaktiv test.',
    },
    {
      q: 'Yangi fanlar qo‘shiladimi?',
      a: 'Ha, muntazam. Yangi mavzular va fanlardan birinchi bo‘lib xabardor bo‘lish uchun Telegram kanalimizga qo‘shiling.',
    },
  ]

  return (
    <div className="relative z-[2]">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section id="top" className="mx-auto max-w-shell px-5 pb-24 pt-16 sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_minmax(0,520px)]">
          <div>
            <span className="pill pill-green !border-brand-line bg-brand-tint font-mono !text-[12.5px] uppercase tracking-[0.04em] text-brand-soft">
              <span className="h-[7px] w-[7px] rounded-full bg-brand" />
              Talabalardan — talabalarga
            </span>

            <h1 className="mt-6 max-w-[13ch] font-serif text-[clamp(46px,5.6vw,82px)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink">
              Tibbiyotni <span className="italic font-medium text-brand">3 bosqichda</span> o‘zlashtiring
            </h1>

            <p className="mt-6 max-w-[46ch] text-[18.5px] leading-relaxed text-ink-soft">
              Videodars, konspekt va test — har bir mavzu uchun. O‘zbek tilidagi birinchi tibbiy
              ta‘lim platformasi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/subjects" className="btn-primary">
                Bepul boshlash <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <Telegram className="h-[18px] w-[18px] text-sky" /> Telegram kanal
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-ink-mute">
              {['100% bepul', 'O‘zbek tilida', 'Mobil & kompyuter'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" /> {t}
                </span>
              ))}
            </div>

            <div className="mt-12 flex max-w-[480px] items-stretch gap-0 border-t border-[rgba(43,39,34,0.12)] pt-6">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex-1 ${i > 0 ? 'border-l border-[rgba(43,39,34,0.12)] pl-5' : ''}`}
                >
                  <div className="font-serif text-[34px] font-semibold text-ink">{s.value}</div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto hidden h-[520px] w-full max-w-[520px] lg:block">
            <div
              className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(127,184,220,0.16), transparent 68%)' }}
            />
            <Capsule className="absolute left-1/2 top-[70px] h-[372px] w-[150px] -translate-x-1/2 rotate-[17deg] animate-floatY [filter:drop-shadow(0_22px_30px_rgba(43,39,34,0.18))]" />
            <StepLabel n="01" title="Videodars" tone="green" icon={<Play className="h-4 w-4" />} className="absolute right-0 top-[40px]" />
            <StepLabel n="02" title="Konspekt" tone="blue" icon={<FileText className="h-4 w-4" />} className="absolute left-0 top-[230px]" />
            <StepLabel n="03" title="Test" tone="green" icon={<CheckCircle className="h-4 w-4" />} className="absolute right-0 top-[400px]" />
          </div>

          {/* Hero visual — mobile / tablet */}
          <div className="flex items-center justify-center gap-6 lg:hidden">
            <Capsule className="h-[260px] w-[105px] shrink-0 rotate-[12deg] animate-floatY [filter:drop-shadow(0_18px_24px_rgba(43,39,34,0.16))]" />
            <div className="flex flex-col gap-3">
              <StepLabel n="01" title="Videodars" tone="green" icon={<Play className="h-4 w-4" />} />
              <StepLabel n="02" title="Konspekt" tone="blue" icon={<FileText className="h-4 w-4" />} />
              <StepLabel n="03" title="Test" tone="green" icon={<CheckCircle className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── HOW IT WORKS ─────────────────── */}
      <section id="qanday" className="border-t border-[rgba(43,39,34,0.10)]">
        <div className="mx-auto max-w-shell px-5 py-24 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="mc-label">Qanday ishlaydi?</span>
              <h2 className="mt-3.5 max-w-[18ch] font-serif text-[clamp(32px,3.6vw,46px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
                Har bir mavzu — uch bosqichda
              </h2>
            </div>
            <p className="max-w-[34ch] text-base text-ink-mute">
              Bir xil o‘rganish strukturasi har bir mavzuda takrorlanadi — shu sabab o‘rganish odatga
              aylanadi.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-stretch gap-4 md:flex-row">
            {steps.map((st, i) => (
              <div key={st.n} className="flex flex-1 items-center gap-4">
                <div
                  className={`relative flex-1 rounded-[18px] bg-sand-card p-7 ${
                    st.featured
                      ? 'border border-brand-line shadow-feature'
                      : 'border border-[rgba(43,39,34,0.10)]'
                  }`}
                >
                  {st.featured && (
                    <span
                      className="absolute left-6 right-6 top-0 h-[3px] rounded-b-[3px]"
                      style={{ background: 'linear-gradient(90deg,#2F6B4F,#7FB8DC)' }}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[15px] font-bold ${st.tone === 'green' ? 'text-brand' : 'text-sky'}`}>
                      {st.n}
                    </span>
                    <span
                      className={`grid h-[46px] w-[46px] place-items-center rounded-xl ${
                        st.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
                      }`}
                    >
                      {st.icon}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-semibold text-ink">{st.title}</h3>
                  <p className="mt-2.5 text-[15.5px] leading-relaxed text-ink-mute">{st.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden h-6 w-6 shrink-0 text-[#bcb09a] md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── WHAT'S INSIDE A LESSON ─────────────── */}
      <section className="border-t border-[rgba(43,39,34,0.08)] bg-sand-deep">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left — explanation */}
          <div>
            <span className="mc-label">Dars ichida</span>
            <h2 className="mt-3.5 max-w-[16ch] font-serif text-[clamp(30px,3.4vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
              Bitta mavzu, uchta qadam — bir oqimda
            </h2>
            <p className="mt-5 max-w-[44ch] text-[16.5px] leading-relaxed text-ink-mute">
              Har bir mavzu video, konspekt va testdan iborat. Boshladingizmi — oxirigacha bir tartibda
              olib boradi. Hech narsa axtarib o‘tirmaysiz.
            </p>

            <ul className="mt-8 space-y-3.5">
              {steps.map(st => (
                <li key={st.n} className="flex items-start gap-3.5">
                  <span
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${
                      st.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
                    }`}
                  >
                    {st.icon}
                  </span>
                  <div>
                    <h3 className="font-serif text-[18px] font-semibold text-ink">{st.title}</h3>
                    <p className="text-[14.5px] leading-relaxed text-ink-mute">{st.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/subjects" className="btn-primary mt-9">
              Mavzularni ko‘rish <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>

          {/* Right — lesson preview mock */}
          <div className="relative">
            <div
              className="absolute -inset-4 -z-10 rounded-[32px] opacity-60 blur-2xl"
              style={{ background: 'radial-gradient(60% 60% at 70% 20%, rgba(47,107,79,0.16), transparent)' }}
              aria-hidden="true"
            />
            <div className="overflow-hidden rounded-[22px] border border-[rgba(43,39,34,0.12)] bg-sand-card shadow-feature">
              {/* tab bar */}
              <div className="flex items-center gap-1.5 border-b border-[rgba(43,39,34,0.1)] px-4 py-3">
                <span className="pill pill-green !py-0.5 !text-[12px]">
                  <Play className="h-3.5 w-3.5" /> Videodars
                </span>
                <span className="pill pill-muted !py-0.5 !text-[12px]">Konspekt</span>
                <span className="pill pill-muted !py-0.5 !text-[12px]">Test</span>
                <span className="ml-auto font-mono text-[11px] text-ink-faint">Anatomiya · 01</span>
              </div>

              {/* video frame */}
              <div
                className="relative grid aspect-video place-items-center"
                style={{ background: 'linear-gradient(135deg,#2F6B4F,#27593f 55%,#3f7da3)' }}
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-brand shadow-lift">
                  <Play className="h-7 w-7" />
                </span>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 font-mono text-[11px] text-white">
                  <Clock className="h-3.5 w-3.5" /> 25:00
                </span>
              </div>

              {/* konspekt + test preview */}
              <div className="space-y-5 p-5">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-sky-text">
                    Konspekt
                  </span>
                  <h4 className="mt-1.5 font-serif text-[17px] font-semibold text-ink">
                    Skelet sistemasi
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    <span className="block h-2.5 w-full rounded-full bg-[rgba(43,39,34,0.07)]" />
                    <span className="block h-2.5 w-11/12 rounded-full bg-[rgba(43,39,34,0.07)]" />
                    <span className="block h-2.5 w-3/4 rounded-full bg-[rgba(43,39,34,0.07)]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand p-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-soft">
                    Test
                  </span>
                  <p className="mt-1.5 text-[14.5px] font-semibold text-ink">
                    Inson skeletida nechta suyak bor?
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { t: '150', ok: false },
                      { t: '180', ok: false },
                      { t: '206', ok: true },
                      { t: '250', ok: false },
                    ].map(o => (
                      <span
                        key={o.t}
                        className={`inline-flex items-center justify-between rounded-xl border px-3 py-2 text-[13.5px] font-medium ${
                          o.ok
                            ? 'border-brand-line bg-brand-tint text-brand'
                            : 'border-[rgba(43,39,34,0.12)] bg-sand-card text-ink-mute'
                        }`}
                      >
                        {o.t}
                        {o.ok && <Check className="h-4 w-4" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── WHY ───────────────────────── */}
      <section id="nega" className="border-t border-[rgba(43,39,34,0.08)]">
        <div className="mx-auto grid max-w-shell gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="mc-label">Nega?</span>
            <h2 className="mt-3.5 font-serif text-[clamp(32px,3.4vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
              Talaba ehtiyojiga qurilgan
            </h2>
            <p className="mt-5 max-w-[34ch] text-[16.5px] leading-relaxed text-ink-mute">
              Biz bunday loyiha bo‘lishi juda muhim deb topdik va o‘zimiz uchun qurdik — endi u sizda
              ham bor.
            </p>
            <div className="mt-7 grid h-16 w-32 place-items-center rounded-[14px] border border-[rgba(43,39,34,0.1)] bg-sand">
              <Capsule className="h-[54px] w-[24px] rotate-[20deg]" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 sm:gap-x-10">
            {benefits.map(b => (
              <div key={b.title} className="flex gap-4 border-b border-[rgba(43,39,34,0.12)] py-6">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-[11px] ${
                    b.tone === 'green' ? 'bg-brand-tint text-brand' : 'bg-sky-tint text-sky'
                  }`}
                >
                  {b.icon}
                </span>
                <div>
                  <h3 className="font-serif text-[19px] font-semibold text-ink">{b.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-mute">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── TEAM ───────────────────────── */}
      <section className="border-t border-[rgba(43,39,34,0.08)] bg-sand-deep">
        <div className="mx-auto max-w-shell px-5 py-24 sm:px-10">
          <div className="max-w-[54ch]">
            <span className="mc-label">Jamoa</span>
            <h2 className="mt-3.5 font-serif text-[clamp(32px,3.6vw,46px)] font-semibold leading-[1.06] tracking-[-0.02em] text-ink">
              Ikki talaba. Bitta g‘oya.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-mute">
              MedCapsula‘ni biz — tibbiyot talabalari — o‘z tajribamizdan kelib chiqib yaratdik.
            </p>
          </div>

          <div className="mt-11 grid gap-6 sm:grid-cols-2">
            {team.map(m => (
              <div
                key={m.name}
                className="flex items-center gap-5 rounded-[20px] border border-[rgba(43,39,34,0.10)] bg-sand-card p-6"
              >
                <a
                  href={m.channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group grid h-[140px] w-[120px] shrink-0 place-items-center content-center gap-2.5 rounded-[14px] border transition-colors ${
                    m.tone === 'green'
                      ? 'border-brand-line bg-brand-tint hover:border-brand'
                      : 'border-[rgba(90,149,190,0.3)] bg-sky-tint hover:border-sky'
                  }`}
                  title={`${m.name} — Telegram kanal`}
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full text-sand shadow-btn-sm transition-transform group-hover:scale-105 ${
                      m.tone === 'green' ? 'bg-brand' : 'bg-sky'
                    }`}
                  >
                    <Telegram className="h-7 w-7" />
                  </span>
                  <span className="max-w-[104px] truncate px-1 font-mono text-[10.5px] text-ink-mute">
                    {m.handle}
                  </span>
                </a>
                <div>
                  <h3 className="font-serif text-[25px] font-semibold text-ink">{m.name}</h3>
                  <span className={`pill mt-2.5 ${m.tone === 'green' ? 'pill-green' : 'pill-blue'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${m.tone === 'green' ? 'bg-brand' : 'bg-sky'}`} />
                    {m.role}
                  </span>
                  <a
                    href={m.channel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-[13.5px] font-medium text-ink-mute transition-colors hover:text-brand"
                  >
                    <Telegram className="h-4 w-4" /> Telegram kanal
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── SUBJECTS ─────────────────────── */}
      <section id="fanlar" className="border-t border-[rgba(43,39,34,0.08)]">
        <div className="mx-auto max-w-shell px-5 py-24 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="mc-label">Fanlar</span>
              <h2 className="mt-3.5 max-w-[20ch] font-serif text-[clamp(30px,3.3vw,42px)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
                {capitalize(numWord(subjects.length))} fan, {numTa(totalLessons)} mavzu — va o‘sib
                bormoqda
              </h2>
            </div>
            <div className="flex gap-5 font-mono text-[13px] text-ink-faint">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand" /> Faol
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border-[1.5px] border-[#b6aa93]" /> Tez orada
              </span>
            </div>
          </div>

          <div className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {active.map((s, i) => (
              <Link
                key={s.id}
                href={`/subjects/${s.slug}`}
                className="group flex min-h-[158px] flex-col rounded-2xl border border-[rgba(43,39,34,0.12)] bg-sand-card p-[22px] transition-all hover:-translate-y-0.5 hover:border-brand-line hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-ink-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-[9px] w-[9px] rounded-full bg-brand" />
                </div>
                <h3 className="mt-auto font-serif text-[22px] font-semibold text-ink">{s.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="pill pill-green">{s.lessonCount} mavzu</span>
                  <ChevronRight className="h-[18px] w-[18px] text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
            {soon.map((s, i) => (
              <div
                key={s.id}
                className="flex min-h-[158px] flex-col rounded-2xl border border-dashed border-[rgba(43,39,34,0.22)] p-[22px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-ink-dim">
                    {String(active.length + i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-[#b6aa93]" />
                </div>
                <h3 className="mt-auto font-serif text-[22px] font-semibold text-[#8a8170]">{s.title}</h3>
                <span className="mt-3 font-mono text-[11.5px] text-ink-faint">Tez orada</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section className="border-t border-[rgba(43,39,34,0.08)] bg-sand-deep">
        <div className="mx-auto max-w-shell px-5 py-24 sm:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="mc-label">Savollar</span>
              <h2 className="mt-3.5 font-serif text-[clamp(30px,3.3vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
                Ko‘p beriladigan savollar
              </h2>
              <p className="mt-5 max-w-[32ch] text-[16px] leading-relaxed text-ink-mute">
                Boshqa savolingiz bormi?{' '}
                <a
                  href={TELEGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Telegram
                </a>{' '}
                orqali yozing — javob beramiz.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[rgba(43,39,34,0.12)] bg-sand-card shadow-card">
              {faqs.map(f => (
                <details
                  key={f.q}
                  className="group border-b border-[rgba(43,39,34,0.1)] last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-serif text-[18px] font-semibold text-ink">{f.q}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgba(43,39,34,0.16)] text-ink-mute transition-transform duration-200 group-open:rotate-45">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="-mt-1 max-w-[60ch] px-6 pb-5 text-[15px] leading-relaxed text-ink-mute">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA ─────────────────────────── */}
      <section className="px-5 py-10 sm:px-10">
        <div
          className="relative mx-auto max-w-shell overflow-hidden rounded-[28px] px-8 py-16 sm:px-14"
          style={{ background: 'linear-gradient(135deg,#2F6B4F,#27593f)' }}
        >
          <div
            className="absolute right-[-30px] top-1/2 hidden h-[440px] w-[200px] -translate-y-1/2 rotate-[30deg] flex-col rounded-[100px] opacity-[0.16] sm:flex"
            aria-hidden="true"
          >
            <span className="h-1/2 w-full bg-white" />
            <span className="h-1/2 w-full bg-sky-light" />
          </div>

          <div className="relative max-w-[30ch]">
            <span className="font-mono text-[13px] uppercase tracking-[0.06em] text-[#a9cdb8]">
              Talabalardan — talabalarga
            </span>
            <h2 className="mt-4 font-serif text-[clamp(34px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.02em] text-sand">
              Bugun birinchi mavzudan boshlang
            </h2>
            <p className="mt-4 text-[17.5px] leading-relaxed text-[#d6e5da]">
              Telegram kanalimizga qo‘shiling va yangiliklardan birinchi bo‘lib xabardor bo‘ling.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/auth/register"
                className="btn inline-flex bg-sand px-6 py-3.5 text-base text-ink shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:bg-white"
              >
                Ro‘yxatdan o‘tish <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex border border-[rgba(245,240,230,0.4)] px-6 py-3.5 text-base text-sand hover:bg-white/10"
              >
                <Telegram className="h-[18px] w-[18px]" /> Telegram kanal
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
