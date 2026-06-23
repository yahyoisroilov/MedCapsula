export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />)}
      </div>
    </div>
  )
}
