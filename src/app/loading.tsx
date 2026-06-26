export default function HomeLoading() {
  return (
    <div className="overflow-hidden">
      <div className="relative z-[2] pt-16 sm:pt-24 pb-20 sm:pb-28 px-5 sm:px-10">
        <div className="mx-auto max-w-shell text-center">
          <div className="h-6 w-64 mx-auto bg-[rgba(43,39,34,0.06)] rounded-full animate-pulse mb-6" />
          <div className="h-12 sm:h-14 w-80 sm:w-96 mx-auto bg-[rgba(43,39,34,0.06)] rounded-xl animate-pulse" />
          <div className="h-4 w-64 mx-auto bg-[rgba(43,39,34,0.06)] rounded-lg mt-5 animate-pulse" />
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-11 w-28 bg-[rgba(43,39,34,0.06)] rounded-xl animate-pulse" />
            <div className="h-11 w-44 bg-[rgba(43,39,34,0.06)] rounded-xl animate-pulse" />
          </div>
          <div className="mt-14 sm:mt-20 max-w-2xl mx-auto">
            <div className="mc-card p-4 sm:p-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-[rgba(43,39,34,0.06)] rounded-full" />
                <div className="h-3 w-1/2 bg-[rgba(43,39,34,0.06)] rounded-full" />
                <div className="h-3 w-5/6 bg-[rgba(43,39,34,0.06)] rounded-full" />
                <div className="h-16 bg-[rgba(43,39,34,0.06)] rounded-xl mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
