import { CapsuleLoader } from '@/components/ui/CapsuleLoader'

export default function LessonLoading() {
  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-10 sm:px-10 sm:py-12">
      {/* Back link */}
      <div className="mc-skeleton h-4 w-28 rounded" />

      {/* Lesson title */}
      <div className="mt-8 space-y-3">
        <div className="mc-skeleton h-3.5 w-24 rounded" />
        <div className="mc-skeleton h-10 w-2/3 max-w-[420px] rounded-xl" />
      </div>

      {/* Stage tabs (Videodars · Konspekt · Test) */}
      <div className="mt-8 flex gap-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="mc-skeleton h-11 flex-1 rounded-xl" />
        ))}
      </div>

      {/* Stage body with centered loader */}
      <div className="mt-5 grid min-h-[320px] place-items-center rounded-2xl border border-[rgba(43,39,34,0.1)] bg-sand-card">
        <CapsuleLoader size="md" label="Dars yuklanmoqda…" />
      </div>
    </div>
  )
}
