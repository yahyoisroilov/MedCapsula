import Link from 'next/link'
import { ChevronRight } from '@/components/ui/icons'

interface SubjectCardProps {
  index: number
  slug: string
  title: string
  lessonCount: number
  doneCount?: number
  comingSoon?: boolean
}

export function SubjectCard({
  index,
  slug,
  title,
  lessonCount,
  doneCount = 0,
  comingSoon,
}: SubjectCardProps) {
  const num = String(index + 1).padStart(2, '0')

  if (comingSoon) {
    return (
      <div className="flex min-h-[172px] flex-col rounded-2xl border border-dashed border-[rgba(43,39,34,0.22)] p-[22px]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-ink-dim">{num}</span>
          <span className="h-2 w-2 rounded-full border-[1.5px] border-[#b6aa93]" />
        </div>
        <h3 className="mt-auto font-serif text-[22px] font-semibold text-[#8a8170]">{title}</h3>
        <span className="mt-3 font-mono text-[11.5px] text-ink-faint">Tez orada</span>
      </div>
    )
  }

  return (
    <Link
      href={`/subjects/${slug}`}
      className="group flex min-h-[172px] flex-col rounded-2xl border border-[rgba(43,39,34,0.12)] bg-sand-card p-[22px] transition-all hover:-translate-y-[3px] hover:border-brand-line hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] text-ink-faint">{num}</span>
        <span className="h-2 w-2 rounded-full bg-brand" />
      </div>
      <h3 className="mt-auto font-serif text-[22px] font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex items-center justify-between">
        <span className="pill pill-green">
          {doneCount > 0 ? `${doneCount}/${lessonCount} mavzu` : `${lessonCount} mavzu`}
        </span>
        <ChevronRight className="h-[18px] w-[18px] text-brand opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
