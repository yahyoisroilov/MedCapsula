import Link from 'next/link'

interface SubjectCardProps {
  slug: string
  title: string
  icon: string
  totalTopics: number
  doneTopics: number
}

export function SubjectCard({ slug, title, icon, totalTopics, doneTopics }: SubjectCardProps) {
  const pct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0

  return (
    <Link
      href={`/subjects/${slug}`}
      className="block text-left glass rounded-2xl p-5 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl accent-grad flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <i className={`fa-solid ${icon} text-white text-lg`}></i>
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-gray-900 dark:text-white leading-tight">{title}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{totalTopics} ta mavzu</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
        <span className="text-gray-500 dark:text-gray-400">{doneTopics}/{totalTopics} tugatildi</span>
        <span className="accent-text">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div className="h-full accent-grad rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  )
}
