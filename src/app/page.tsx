import Link from 'next/link'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getCourses() {
  try {
    const supabase = await createClient()
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true })

    return await Promise.all(
      (courses || []).map(async (course) => {
        const { count } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_index')
          .eq('course_id', course.id)
          .eq('step', 'done')

        return {
          slug: course.slug,
          title: course.title,
          icon: course.icon || 'fa-book-medical',
          totalTopics: count || 0,
          doneTopics: progress?.length || 0,
        }
      })
    )
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const supabase = await createClient()
    const { count: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true)
    const { count: lessons } = await supabase.from('lessons').select('*', { count: 'exact', head: true })
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin')
    const { count: completed } = await supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('step', 'done')
    return { courses: courses || 0, lessons: lessons || 0, users: users || 0, completed: completed || 0 }
  } catch {
    return { courses: 0, lessons: 0, users: 0, completed: 0 }
  }
}

export default async function LandingPage() {
  const courses = await getCourses()
  const stats = await getStats()

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 -z-10 bg-grid opacity-70"
        />

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <i className="fa-solid fa-graduation-cap"></i>
            <span>Talabalardan — Talabalarga</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight max-w-3xl mx-auto text-balance">
            Tibbiyotni{' '}
            <span className="text-gradient">3 bosqichda</span>
            <br />
            o&apos;zlashtiring
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Yuzlab sahifa o&apos;rniga — 3 qadam. Boshqa tibbiyot talabalari bilan birga o&apos;rganilgan usul.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/register"
              className="accent-bg rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition"
            >
              Bepul boshlash <i className="fa-solid fa-arrow-right ml-1.5"></i>
            </Link>
            <Link
              href="/subjects"
              className="glass rounded-xl px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 transition"
            >
              Fanlarni ko&apos;rish
            </Link>
          </div>

          <div className="mt-14 sm:mt-20 max-w-lg mx-auto">
            <div className="relative glass rounded-2xl p-6 sm:p-7 shadow-2xl shadow-emerald-500/5">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 blur-xl -z-10" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
                {[
                  { value: stats.courses, label: 'Fanlar', icon: 'fa-book' },
                  { value: stats.lessons, label: 'Mavzular', icon: 'fa-video' },
                  { value: stats.users, label: 'Talabalar', icon: 'fa-user-graduate' },
                  { value: stats.completed, label: 'Tugatilgan', icon: 'fa-check-circle' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                      <i className={`fa-solid ${s.icon}`}></i>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Qanday ishlaydi?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Har bir mavzu bir xil tuzilishga ega — va bu tasodif emas. 3 bosqich bilimni mustahkam yodda qoldirish uchun mo&apos;ljallangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                icon: 'fa-play',
                title: 'Videodars',
                desc: 'Mavzuni video orqali birinchi marta tushuning. Qisqa, aniq va diqqatni chalg\'itmasdan.',
                gradient: 'from-cyan-400/20 to-cyan-500/5',
                border: 'border-cyan-400/20',
                iconBg: 'bg-cyan-500/10 text-cyan-400',
              },
              {
                step: '02',
                icon: 'fa-book-open',
                title: 'Konspekt',
                desc: 'Videodarsning asosiy nuqtalarini konspektdan o\'qing. Istalgan vaqt qaytib murojaat qilish uchun qulay.',
                gradient: 'from-emerald-400/20 to-emerald-500/5',
                border: 'border-emerald-400/20',
                iconBg: 'bg-emerald-500/10 text-emerald-400',
              },
              {
                step: '03',
                icon: 'fa-list-check',
                title: 'Test',
                desc: 'Interaktiv testlar bilan bilimingizni sinab ko\'ring. Natijalaringizni kuzatib, zaif tomonlarni aniqlang.',
                gradient: 'from-teal-400/20 to-teal-500/5',
                border: 'border-teal-400/20',
                iconBg: 'bg-teal-500/10 text-teal-400',
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden hover:-translate-y-0.5 transition border-black/5 dark:border-white/5"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`h-12 w-12 rounded-xl ${s.iconBg} flex items-center justify-center text-lg`}>
                      <i className={`fa-solid ${s.icon}`}></i>
                    </div>
                    <span className="text-3xl sm:text-4xl font-black text-gray-200 dark:text-white/5">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Nega aynan MedCapsula?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Tibbiyot talabasiga nima kerakligini biz bilamiz — chunki biz ham tibbiyot talabasimiz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: 'fa-mobile-screen', title: 'Har qayerdan kirish', desc: 'Telefon, planshet yoki kompyuterdan bemalol foydalaning.' },
              { icon: 'fa-chart-line', title: 'Progress kuzatuvi', desc: 'Qaysi mavzuni o\'tganingiz va nima qolganini doim ko\'rasiz.' },
              { icon: 'fa-clock', title: 'Vaqtni tejang', desc: 'Faqat kerakli bilim. Uzun tushuntirishlar va bo\'sh gaplarsiz.' },
              { icon: 'fa-brain', title: '3 xil format', desc: 'Video + konspekt + test — bilim mustahkam yodda qoladi.' },
              { icon: 'fa-pen-to-square', title: 'Interaktiv testlar', desc: 'Har bir mavzu yakunida o\'z darajangizni aniqlang.' },
              { icon: 'fa-heart', title: 'Talabalar uchun', desc: 'Real ehtiyojlar asosida, tibbiyot talabalari tomonidan yaratilgan.' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-0.5 transition">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-sm">
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Bizning jamoa</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Biz — ikki tibbiyot talabasi. O&apos;zimizga kerakli platforma yo&apos;qligini ko&apos;rdik — va o&apos;zimiz yaratdik.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[
              {
                name: 'Yahyobek',
                role: 'Tibbiyot talabasi & Dasturchi',
                bio: 'Frontend va backend ishlab chiqishdan texnik arxitekturagacha — MedCapsuladagi barcha texnik yechimlar uning qo\'lida.',
                icon: 'fa-laptop-code',
                gradient: 'from-cyan-400 to-cyan-500',
              },
              {
                name: 'Ismoil',
                role: 'Tibbiyot talabasi & Kontent muharriri',
                bio: 'Videodarslar, konspektlar va testlar — barchasini tibbiy bilimi asosida o\'zi tayyorlaydi va sifatini nazorat qiladi.',
                icon: 'fa-stethoscope',
                gradient: 'from-emerald-400 to-emerald-500',
              },
            ].map((m) => (
              <div key={m.name} className="glass rounded-2xl p-6 text-center hover:-translate-y-0.5 transition">
                <div
                  className={`h-16 w-16 mx-auto rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg`}
                >
                  <i className={`fa-solid ${m.icon} text-white text-xl`}></i>
                </div>
                <h3 className="mt-4 font-extrabold text-gray-900 dark:text-white">{m.name}</h3>
                <p className="text-xs font-semibold text-emerald-500 mt-0.5">{m.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses preview ── */}
      {courses.length > 0 && (
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Fanlar</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">O&apos;rganishni boshlash uchun fanni tanlang.</p>
              </div>
              <Link
                href="/subjects"
                className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition flex items-center gap-1"
              >
                Barchasi <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(s => (
                <SubjectCard key={s.slug} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="relative glass rounded-3xl p-8 sm:p-14 text-center overflow-hidden">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)',
              }}
            />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white max-w-md mx-auto text-balance">
              Bugun o&apos;rganishni boshlang
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-sm mx-auto">
              Ro&apos;yxatdan o&apos;tish bepul va bir daqiqa vaqt oladi. Birinchi darsga hoziroq kirish mumkin.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/auth/register"
                className="accent-bg rounded-xl px-7 py-3 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition"
              >
                Bepul ro&apos;yxatdan o&apos;tish <i className="fa-solid fa-arrow-right ml-1.5"></i>
              </Link>
              <Link
                href="/subjects"
                className="glass rounded-xl px-7 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 transition"
              >
                Fanlarni ko&apos;rish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 dark:border-white/5 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md accent-grad flex items-center justify-center">
              <i className="fa-solid fa-capsules text-white text-[8px]"></i>
            </div>
            MedCapsula &copy; {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://t.me/Med_Capsula" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition flex items-center gap-1">
              <i className="fa-brands fa-telegram"></i> Telegram
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
