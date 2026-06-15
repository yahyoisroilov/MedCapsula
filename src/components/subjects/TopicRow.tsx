import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TopicRowProps {
  slug: string
  index: number
  title: string
  step: string | number
  subjectTitle: string
}

export function TopicRow({ slug, index, title, step, subjectTitle }: TopicRowProps) {
  const isDone = step === 'done'
  const isStarted = (step === 'done' || Number(step) > 0) && !isDone

  let badge, ring
  if (isDone) {
    badge = (
      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg shrink-0">
        Tugatildi
      </span>
    )
    ring = 'border-emerald-500/30'
  } else if (isStarted) {
    badge = (
      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg shrink-0">
        Jarayonda
      </span>
    )
    ring = 'border-cyan-500/20'
  } else {
    badge = (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-200/60 dark:bg-white/5 px-2 py-1 rounded-lg shrink-0">
        Boshlanmagan
      </span>
    )
    ring = 'border-black/5 dark:border-white/5'
  }

  const icon = isDone
    ? <i className="fa-solid fa-circle-check text-emerald-500"></i>
    : <span className="text-xs font-bold text-gray-400">{index + 1}</span>

  return (
    <Link
      href={`/subjects/${slug}/${index}`}
      className={cn(
        'w-full flex items-center gap-4 text-left glass border rounded-xl p-4 hover:-translate-y-0.5 transition-all',
        ring
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 dark:text-white truncate">{title}</div>
        <div className="flex items-center gap-1.5 mt-2">
          {['Video', 'Notes', 'Quiz'].map((lb, idx) => {
            const reached = isDone ? true : idx < Number(step)
            return (
              <span
                key={lb}
                title={lb}
                className={cn(
                  'h-2 w-2 rounded-full',
                  reached ? 'accent-bg' : 'bg-gray-300 dark:bg-white/15'
                )}
              />
            )
          })}
        </div>
      </div>
      {badge}
      <i className="fa-solid fa-chevron-right text-gray-300 dark:text-gray-600 text-xs"></i>
    </Link>
  )
}
