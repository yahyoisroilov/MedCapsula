import { CapsuleLoader } from '@/components/ui/CapsuleLoader'

export default function SubjectsLoading() {
  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-14 sm:px-10 sm:py-16">
      {/* Header skeleton */}
      <div className="max-w-[46ch]">
        <div className="mc-skeleton h-4 w-24 rounded" />
        <div className="mt-4 space-y-3">
          <div className="mc-skeleton h-9 w-full max-w-[420px] rounded-xl" />
          <div className="mc-skeleton h-9 w-2/3 max-w-[280px] rounded-xl" />
        </div>
        <div className="mc-skeleton mt-4 h-4 w-full max-w-[440px] rounded-lg" />
      </div>

      {/* Centered branded loader */}
      <div className="py-12">
        <CapsuleLoader size="md" label="Fanlar yuklanmoqda…" />
      </div>

      {/* Grid skeleton (matches the subject cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            className="flex min-h-[158px] flex-col rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card p-[22px]"
          >
            <div className="flex items-center justify-between">
              <div className="mc-skeleton h-3 w-6 rounded" />
              <div className="mc-skeleton h-2.5 w-2.5 rounded-full" />
            </div>
            <div className="mc-skeleton mt-auto h-6 w-28 rounded-lg" />
            <div className="mt-3 flex items-center justify-between">
              <div className="mc-skeleton h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
