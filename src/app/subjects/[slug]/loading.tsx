import { CapsuleLoader } from '@/components/ui/CapsuleLoader'

export default function SubjectTopicsLoading() {
  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-10 sm:px-10 sm:py-12">
      {/* Back link + header */}
      <div className="mc-skeleton h-4 w-28 rounded" />
      <div className="mt-8 space-y-3">
        <div className="mc-skeleton h-3.5 w-20 rounded" />
        <div className="mc-skeleton h-11 w-72 max-w-full rounded-xl" />
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="mc-skeleton h-4 w-20 rounded" />
        ))}
      </div>

      {/* Centered loader */}
      <div className="py-10">
        <CapsuleLoader size="sm" label="Mavzular yuklanmoqda…" />
      </div>

      {/* Topic rows */}
      <div className="border-t border-[rgba(43,39,34,0.1)]">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[rgba(43,39,34,0.08)] py-5"
          >
            <div className="mc-skeleton h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="mc-skeleton h-5 w-1/2 rounded-lg" />
              <div className="mc-skeleton h-3 w-24 rounded" />
            </div>
            <div className="mc-skeleton hidden h-2 w-24 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
