export default function SubjectsLoading() {
  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <div className="mb-6">
        <div className="h-8 w-24 bg-[rgba(43,39,34,0.06)] rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-[rgba(43,39,34,0.06)] rounded-lg mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="mc-card p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[rgba(43,39,34,0.06)]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-[rgba(43,39,34,0.06)] rounded-lg" />
                <div className="h-3 w-16 bg-[rgba(43,39,34,0.06)] rounded-lg" />
              </div>
            </div>
            <div className="h-2 w-full bg-[rgba(43,39,34,0.06)] rounded-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
