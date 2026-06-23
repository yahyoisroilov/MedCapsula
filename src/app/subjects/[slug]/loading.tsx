export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/10" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded" />
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-white/10 rounded-xl" />)}
      </div>
    </div>
  )
}
