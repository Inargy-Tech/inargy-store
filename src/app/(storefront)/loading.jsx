export default function StorefrontLoading() {
  return (
    <div className="py-10">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-border/50 rounded-lg animate-pulse mb-8" />

      {/* Search + filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 h-11 bg-border/50 rounded-xl animate-pulse" />
        <div className="w-40 h-11 bg-border/50 rounded-xl animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-border p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-border/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="aspect-square bg-border/30 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-16 bg-border/30 rounded animate-pulse" />
                <div className="h-5 w-full bg-border/40 rounded animate-pulse" />
                <div className="h-6 w-24 bg-border/40 rounded animate-pulse" />
                <div className="h-10 w-full bg-border/30 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
