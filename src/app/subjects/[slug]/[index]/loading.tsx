export default function Loading() {
  return (
    <div className="relative z-[2] mx-auto max-w-shell px-5 py-12 sm:px-10">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-[rgba(43,39,34,0.06)] rounded" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[rgba(43,39,34,0.06)] rounded-2xl" />)}
      </div>
    </div>
  )
}
