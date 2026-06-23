'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  q: string
  a: string[]
  correct: number
  exp?: string
}

interface StepFlowProps {
  lesson: {
    id: string
    title: string
    description: string | null
    videoUrl: string | null
    notesContent: string | null
    quiz: string | null
    duration: number | null
  }
  courseId: string
  slug: string
  lessonIndex: number
  initialStep: string | number
}

const steps = [
  { n: 1, label: 'Video', icon: 'fa-play' },
  { n: 2, label: "O'qish", icon: 'fa-book-open' },
  { n: 3, label: 'Test', icon: 'fa-list-check' },
]

function completedCount(step: string | number): number {
  if (step === 'done') return 3
  const s = typeof step === 'string' ? parseInt(step) || 0 : step
  return Math.min(s, 3)
}

export function StepFlow({ lesson, courseId, slug, lessonIndex, initialStep }: StepFlowProps) {
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

  const saveProgress = useCallback(async (step: string | number) => {
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
  }, [courseId, lessonIndex])

  useEffect(() => {
    if (topicStep === 2) {
      setQuizState({ idx: 0, score: 0, selected: null, finished: false })
    }
  }, [topicStep])

  const completeStep = async (step: number) => {
    const cur = initialStep
    let next: string | number
    if (step === 2) next = 'done'
    else next = Math.max(typeof cur === 'number' ? cur : 0, step + 1)

    if (cur !== 'done') {
      await saveProgress(next)
    }
    if (step < 2) {
      setTopicStep(step + 1)
      if (step + 1 === 2 && !quizState) {
        setQuizState({ idx: 0, score: 0, selected: null, finished: false })
      }
    }
  }

  const questions: QuizQuestion[] = (() => {
    try {
      return JSON.parse(lesson.quiz || '[]')
    } catch { return [] }
  })()

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        {steps.map((st, idx) => {
          const done = idx < completed
          const active = idx === topicStep
          const dotCls = active
            ? 'accent-bg text-white shadow-md shadow-emerald-500/30'
            : done
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-gray-200 dark:bg-white/5 text-gray-400'
          return (
            <button
              key={st.n}
              onClick={() => {
                if (idx <= completed) setTopicStep(idx)
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <span className={cn('h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition', dotCls)}>
                {done && !active
                  ? <i className="fa-solid fa-check"></i>
                  : <i className={`fa-solid ${st.icon}`}></i>
                }
              </span>
              <span className={cn('hidden sm:inline text-xs font-bold', active ? 'accent-text' : 'text-gray-400')}>
                {st.n}. {st.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="animate-slide-in">
        {topicStep === 0 && (
          <div>
            {lesson.videoUrl ? (
              lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                <div className="relative w-full rounded-2xl overflow-hidden glass" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={lesson.videoUrl}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden glass" style={{ aspectRatio: '16/9' }}>
                  <video
                    className="absolute inset-0 w-full h-full"
                    src={lesson.videoUrl}
                    controls
                    playsInline
                  />
                </div>
              )
            ) : (
              <div className="glass rounded-2xl p-10 text-center">
                <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-video-slash text-gray-400 text-xl"></i>
                </div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200">Video hali qo'shilmagan</h3>
                <p className="text-xs text-gray-400 mt-1">Bu mavzu uchun video keyinroq qo'shiladi.</p>
              </div>
            )}
            <div className="flex justify-end mt-5">
              <button
                onClick={() => completeStep(0)}
                className="accent-bg rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 transition"
              >
                Videoni ko'rdim — Davom etish <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {topicStep === 1 && (
          <div>
            {lesson.notesContent ? (
              <div className="glass rounded-2xl p-6 leading-relaxed text-[15px] text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <i className="fa-solid fa-book-open"></i> Konspekt
                </div>
                <div className="whitespace-pre-wrap">{lesson.notesContent}</div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-10 text-center">
                <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-file-circle-xmark text-gray-400 text-xl"></i>
                </div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200">Konspekt hali yo'q</h3>
                <p className="text-xs text-gray-400 mt-1">Bu mavzu uchun matn keyinroq qo'shiladi.</p>
              </div>
            )}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setTopicStep(0)}
                className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left"></i> Video
              </button>
              <button
                onClick={() => completeStep(1)}
                className="accent-bg rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 transition"
              >
                O'qib chiqdim — Davom etish <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {topicStep === 2 && (
          <div>
            {questions.length === 0 ? (
              <div>
                <div className="glass rounded-2xl p-10 text-center">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <i className="fa-solid fa-clipboard-question text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">Test hali yo'q</h3>
                  <p className="text-xs text-gray-400 mt-1">Bu mavzu uchun savollar keyinroq qo'shiladi.</p>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <button onClick={() => setTopicStep(1)} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-arrow-left"></i> O'qish
                  </button>
                  <button onClick={() => completeStep(2)} className="accent-bg rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2">
                    <i className="fa-solid fa-check"></i> Mavzuni yakunlash
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
                slug={slug}
                lessonIndex={lessonIndex}
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
}: {
  questions: QuizQuestion[]
  quizState: { idx: number; score: number; selected: number | null; finished: boolean }
  setQuizState: (s: any) => void
  onFinish: () => void
  onBack: () => void
  slug: string
  lessonIndex: number
}) {
  if (quizState.finished) {
    const pct = questions.length > 0 ? Math.round((quizState.score / questions.length) * 100) : 0
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="h-16 w-16 mx-auto rounded-full accent-grad flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
          <i className="fa-solid fa-trophy text-white text-2xl"></i>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{quizState.score} / {questions.length}</h3>
        <p className="text-sm text-gray-400 mt-1">{pct}% to'g'ri javob</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setQuizState({ idx: 0, score: 0, selected: null, finished: false })}
            className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90"
          >
            <i className="fa-solid fa-rotate-right mr-1.5"></i> Qayta urinish
          </button>
          <button onClick={onFinish} className="accent-bg rounded-xl px-5 py-2.5 text-sm font-bold">
            <i className="fa-solid fa-check mr-1.5"></i> Tugatish
          </button>
        </div>
      </div>
    )
  }

  const q = questions[quizState.idx]
  const answered = quizState.selected !== null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400">Savol {quizState.idx + 1} / {questions.length}</span>
        <div className="h-1.5 w-32 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div className="h-full accent-grad" style={{ width: `${((quizState.idx) / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="glass rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug">{q.q}</h3>
      </div>
      <div className="space-y-2.5">
        {q.a.map((opt, oi) => {
          let cls = 'glass hover:border-emerald-500/40'
          if (answered) {
            if (oi === q.correct) {
              cls = 'border-2 border-emerald-500 bg-emerald-500/10'
            } else if (oi === quizState.selected) {
              cls = 'border-2 border-red-500 bg-red-500/10'
            } else {
              cls = 'glass opacity-60'
            }
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
              className={`w-full text-left rounded-xl px-4 py-3.5 text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center justify-between gap-3 transition ${cls}`}
            >
              <span>{opt}</span>
              {answered && oi === q.correct && <i className="fa-solid fa-check text-emerald-500"></i>}
              {answered && oi === quizState.selected && oi !== q.correct && <i className="fa-solid fa-xmark text-red-500"></i>}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="flex justify-end mt-5">
          <button
            onClick={() => {
              if (quizState.idx + 1 < questions.length) {
                setQuizState({ ...quizState, idx: quizState.idx + 1, selected: null })
              } else {
                setQuizState({ ...quizState, finished: true })
              }
            }}
            className="accent-bg rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2"
          >
            {quizState.idx + 1 < questions.length ? 'Keyingi savol' : 'Yakunlash'}
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
      <div className="mt-5">
        <button onClick={onBack} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 flex items-center gap-1.5">
          <i className="fa-solid fa-arrow-left"></i> O'qish
        </button>
      </div>
    </div>
  )
}
