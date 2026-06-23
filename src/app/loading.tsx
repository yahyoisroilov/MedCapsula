export default function HomeLoading() {
  return (
    <div className="overflow-hidden">
      <div className="pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="h-6 w-64 mx-auto bg-gray-200 dark:bg-white/10 rounded-full animate-pulse mb-6" />
          <div className="h-12 sm:h-14 w-80 sm:w-96 mx-auto bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 w-64 mx-auto bg-gray-200 dark:bg-white/10 rounded-lg mt-5 animate-pulse" />
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-11 w-28 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-11 w-44 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="mt-14 sm:mt-20 max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-4 sm:p-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-3 w-5/6 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-16 bg-gray-200 dark:bg-white/10 rounded-xl mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
