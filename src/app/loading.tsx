export default function HomeLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded-lg mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded-lg" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded-lg" />
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
