import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronRight } from '@/components/ui/icons'

interface TopicRowProps {
  slug: string
  index: number
  title: string
  step: string | number
}

const STAGES = ['Videodars', 'Konspekt', 'Test']

export function TopicRow({ slug, index, title, step }: TopicRowProps) {
  const isDone = step === 'done'
  const reached = isDone ? 3 : Number(step) || 0
  const isStarted = reached > 0

  let badge: { label: string; cls: string }
  if (isDone) badge = { label: 'Tugatildi', cls: 'pill-green' }
  else if (isStarted) badge = { label: 'Davom etmoqda', cls: 'pill-blue' }
  else badge = { label: 'Boshlanmagan', cls: 'pill-muted' }

  return (
    <Link
      href={`/subjects/${slug}/${index}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-[rgba(43,39,34,0.10)] py-5 transition-colors hover:bg-[rgba(43,39,34,0.02)]"
    >
      <span className="min-w-[24px] font-mono text-[14px] text-ink-faint">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span
        className={cn(
          'h-2.5 w-2.5 shrink-0 rounded-full',
          isStarted ? 'bg-brand' : 'border-[1.5px] border-[#b6aa93]',
        )}
      />

      <span className="order-2 w-full font-serif text-[21px] font-semibold text-ink sm:order-none sm:w-auto sm:flex-1">
        {title}
      </span>

      <span className={cn('pill shrink-0 whitespace-nowrap', badge.cls)}>{badge.label}</span>

      <span className="flex min-w-[64px] shrink-0 items-center justify-end gap-1.5">
        {STAGES.map((label, i) => (
          <span
            key={label}
            title={label}
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              i < reached ? 'bg-brand' : 'border-[1.5px] border-[#b6aa93]',
            )}
          />
        ))}
        <ChevronRight className="h-4 w-4 text-ink-dim opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </Link>
  )
}
