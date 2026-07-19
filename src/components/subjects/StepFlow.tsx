'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/ui/KonspektContent'
import {
  Play,
  FileText,
  ClipboardCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCw,
} from '@/components/ui/icons'

interface QuizQuestion {
  q: string
  a: string[]
  correct: number
  exp?: string
  img?: string
}

interface StepFlowProps {
  lesson: {
    id: string
    title: string
    description: string | null
    videoUrl: string | null
    notesContent: string | null
    quiz: unknown
    duration: number | null
  }
  courseId: string
  slug: string
  lessonIndex: number
  initialStep: string | number
}

const steps = [
  { n: 1, label: 'Videodars', Icon: Play },
  { n: 2, label: 'Konspekt', Icon: FileText },
  { n: 3, label: 'Test', Icon: ClipboardCheck },
]

function completedCount(step: string | number): number {
  if (step === 'done') return 3
  const s = typeof step === 'string' ? parseInt(step) || 0 : step
  return Math.min(s, 3)
}

function parseQuiz(raw: unknown): QuizQuestion[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as QuizQuestion[]
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mc-card p-12 text-center">
      <h3 className="font-serif text-xl text-ink-mute">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-faint">{sub}</p>
    </div>
  )
}

export function StepFlow({ lesson, courseId, slug, lessonIndex, initialStep }: StepFlowProps) {
  const router = useRouter()
  const [finishing, setFinishing] = useState(false)
  const [topicStep, setTopicStep] = useState(() => {
    if (initialStep === 'done') return 2
    return Math.min(Number(initialStep), 2)
  })
  const [completed, setCompleted] = useState(completedCount(initialStep))
  const [quizState, setQuizState] = useState<{
    idx: number
    score: number
    selected: number | null
    finished: boolean
  } | null>(null)

  const saveProgress = useCallback(
    async (step: string | number) => {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, lessonIndex, step: String(step) }),
        })
        setCompleted(completedCount(step))
      } catch (e) {
        console.error('saveProgress', e)
      }
    },
    [courseId, lessonIndex],
  )

  useEffect(() => {
    if (topicStep === 2) {
      setQuizState(prev => prev ?? { idx: 0, score: 0, selected: null, finished: false })
    }
  }, [topicStep])

  const completeStep = async (step: number) => {
    const cur = initialStep

    // Final step: mark the topic done and return to the subject page.
    if (step === 2) {
      setFinishing(true)
      if (cur !== 'done') await saveProgress('done')
      router.push(`/subjects/${slug}`)
      router.refresh()
      return
    }

    const next = Math.max(typeof cur === 'number' ? cur : 0, step + 1)
    if (cur !== 'done') await saveProgress(next)
    setTopicStep(step + 1)
    if (step + 1 === 2 && !quizState) {
      setQuizState({ idx: 0, score: 0, selected: null, finished: false })
    }
  }

  const questions = parseQuiz(lesson.quiz)
  const isYouTube =
    lesson.videoUrl &&
    (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be'))

  return (
    <div>
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2 sm:gap-3">
        {steps.map((st, idx) => {
          const done = idx < completed
          const active = idx === topicStep
          return (
            <div key={st.n} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (idx <= completed) setTopicStep(idx)
                }}
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-full transition-all',
                    active
                      ? 'bg-brand text-sand shadow-btn-sm'
                      : done
                        ? 'bg-brand-tint text-brand'
                        : 'bg-[rgba(43,39,34,0.05)] text-ink-faint',
                  )}
                >
                  {done && !active ? <Check className="h-5 w-5" /> : <st.Icon className="h-5 w-5" />}
                </span>
                <span
                  className={cn(
                    'hidden font-mono text-[12px] uppercase tracking-[0.04em] sm:inline',
                    active ? 'text-brand' : 'text-ink-faint',
                  )}
                >
                  {st.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <span
                  className={cn(
                    'h-px flex-1 transition-colors',
                    idx < completed ? 'bg-brand/40' : 'bg-[rgba(43,39,34,0.12)]',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="animate-slide-in">
        {/* ── Step 0 · Video ── */}
        {topicStep === 0 && (
          <div>
            {lesson.videoUrl ? (
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-[rgba(43,39,34,0.1)] bg-black"
                style={{ aspectRatio: '16/9' }}
              >
                {isYouTube ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={lesson.videoUrl}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video className="absolute inset-0 h-full w-full" src={lesson.videoUrl} controls playsInline />
                )}
              </div>
            ) : (
              <EmptyState title="Video hali qo‘shilmagan" sub="Bu mavzu uchun video keyinroq qo‘shiladi." />
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => completeStep(0)} className="btn-sm px-5 py-3">
                Videoni ko‘rdim — Davom etish <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1 · Konspekt ── */}
        {topicStep === 1 && (
          <div>
            {lesson.notesContent ? (
              <div className="mc-card p-7 sm:p-8">
                <div className="mb-5 flex items-center gap-2 border-b border-[rgba(43,39,34,0.08)] pb-4 font-mono text-[12px] uppercase tracking-[0.06em] text-brand-soft">
                  <FileText className="h-4 w-4 text-brand" /> Konspekt
                </div>
                <MarkdownRenderer content={lesson.notesContent} />
              </div>
            ) : (
              <EmptyState title="Konspekt hali yo‘q" sub="Bu mavzu uchun matn keyinroq qo‘shiladi." />
            )}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setTopicStep(0)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute hover:text-brand"
              >
                <ArrowLeft className="h-4 w-4" /> Videodars
              </button>
              <button onClick={() => completeStep(1)} className="btn-sm px-5 py-3">
                O‘qib chiqdim — Davom etish <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 · Test ── */}
        {topicStep === 2 && (
          <div>
            {questions.length === 0 ? (
              <div>
                <EmptyState title="Test hali yo‘q" sub="Bu mavzu uchun savollar keyinroq qo‘shiladi." />
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setTopicStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute hover:text-brand"
                  >
                    <ArrowLeft className="h-4 w-4" /> Konspekt
                  </button>
                  <button
                    onClick={() => completeStep(2)}
                    disabled={finishing}
                    className="btn-sm px-5 py-3 disabled:opacity-60"
                  >
                    {finishing ? (
                      <RotateCw className="h-[18px] w-[18px] animate-spin" />
                    ) : (
                      <Check className="h-[18px] w-[18px]" />
                    )}
                    Mavzuni yakunlash
                  </button>
                </div>
              </div>
            ) : (
              <QuizContent
                questions={questions}
                quizState={quizState || { idx: 0, score: 0, selected: null, finished: false }}
                setQuizState={setQuizState}
                onFinish={() => completeStep(2)}
                onBack={() => setTopicStep(1)}
                finishing={finishing}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QuizContent({
  questions,
  quizState,
  setQuizState,
  onFinish,
  onBack,
  finishing,
}: {
  questions: QuizQuestion[]
  quizState: { idx: number; score: number; selected: number | null; finished: boolean }
  setQuizState: (s: { idx: number; score: number; selected: number | null; finished: boolean }) => void
  onFinish: () => void
  onBack: () => void
  finishing: boolean
}) {
  if (quizState.finished) {
    const pct = questions.length > 0 ? Math.round((quizState.score / questions.length) * 100) : 0
    return (
      <div className="mc-card p-10 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand text-sand shadow-btn-sm">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-3xl font-semibold text-ink">
          {quizState.score} / {questions.length}
        </h3>
        <p className="mt-1 text-sm text-ink-faint">{pct}% to‘g‘ri javob</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setQuizState({ idx: 0, score: 0, selected: null, finished: false })}
            className="btn-secondary px-5 py-2.5 text-sm"
          >
            <RotateCw className="h-4 w-4" /> Qayta urinish
          </button>
          <button onClick={onFinish} disabled={finishing} className="btn-sm px-5 py-2.5 disabled:opacity-60">
            {finishing ? <RotateCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Tugatish
          </button>
        </div>
      </div>
    )
  }

  const q = questions[quizState.idx]
  const answered = quizState.selected !== null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink-faint">
          Savol {quizState.idx + 1} / {questions.length}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[rgba(43,39,34,0.1)]">
          <div className="h-full bg-brand" style={{ width: `${(quizState.idx / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="mc-card mb-4 p-6">
        {q.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={q.img}
            alt=""
            className="mb-4 max-h-[320px] w-full rounded-xl border border-[rgba(43,39,34,0.1)] object-contain"
          />
        )}
        <h3 className="font-serif text-[20px] font-semibold leading-snug text-ink">{q.q}</h3>
      </div>

      <div className="space-y-2.5">
        {q.a.map((opt, oi) => {
          let cls = 'border-[rgba(43,39,34,0.12)] bg-sand-card hover:border-brand-line'
          if (answered) {
            if (oi === q.correct) cls = 'border-brand bg-brand-tint'
            else if (oi === quizState.selected) cls = 'border-[#cf9a90] bg-[#f4e3df]'
            else cls = 'border-[rgba(43,39,34,0.1)] bg-sand-card opacity-60'
          }
          return (
            <button
              key={oi}
              disabled={answered}
              onClick={() => {
                if (quizState.selected !== null) return
                const newState = { ...quizState, selected: oi }
                if (oi === q.correct) newState.score++
                setQuizState(newState)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] text-ink transition-all',
                cls,
              )}
            >
              <span>{opt}</span>
              {answered && oi === q.correct && <Check className="h-5 w-5 text-brand" />}
            </button>
          )
        })}
      </div>

      {answered && q.exp && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-line bg-brand-tint px-4 py-3.5 text-[15px] leading-relaxed text-[#2c5e46]">
          {q.exp}
        </div>
      )}

      {answered && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (quizState.idx + 1 < questions.length) {
                setQuizState({ ...quizState, idx: quizState.idx + 1, selected: null })
              } else {
                setQuizState({ ...quizState, finished: true })
              }
            }}
            className="btn-sm px-5 py-3"
          >
            {quizState.idx + 1 < questions.length ? 'Keyingi savol' : 'Yakunlash'}
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Konspekt
        </button>
      </div>
    </div>
  )
}
