import { CapsuleLoader } from '@/components/ui/CapsuleLoader'

export default function HomeLoading() {
  return (
    <div className="relative z-[2] overflow-hidden">
      <section className="mx-auto max-w-shell px-5 pb-24 pt-16 sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_minmax(0,520px)]">
          {/* Left — hero text skeleton */}
          <div>
            <div className="mc-skeleton h-7 w-60 rounded-full" />
            <div className="mt-6 space-y-3">
              <div className="mc-skeleton h-12 w-full max-w-[460px] rounded-xl" />
              <div className="mc-skeleton h-12 w-3/4 max-w-[340px] rounded-xl" />
            </div>
            <div className="mt-6 space-y-2.5">
              <div className="mc-skeleton h-4 w-full max-w-[420px] rounded-lg" />
              <div className="mc-skeleton h-4 w-2/3 max-w-[300px] rounded-lg" />
            </div>
            <div className="mt-8 flex gap-3.5">
              <div className="mc-skeleton h-12 w-40 rounded-xl" />
              <div className="mc-skeleton h-12 w-44 rounded-xl" />
            </div>
            <div className="mt-12 flex max-w-[480px] gap-6 border-t border-[rgba(43,39,34,0.12)] pt-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex-1 space-y-2">
                  <div className="mc-skeleton h-9 w-16 rounded-lg" />
                  <div className="mc-skeleton h-3 w-14 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right — branded capsule loader as the hero visual */}
          <div className="grid min-h-[360px] place-items-center lg:min-h-[440px]">
            <CapsuleLoader size="lg" />
          </div>
        </div>
      </section>
    </div>
  )
}
