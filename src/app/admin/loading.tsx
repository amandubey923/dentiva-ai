// Admin dashboard loading skeleton
export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-24 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 w-64 bg-muted/50 rounded-lg mb-2" />
          <div className="h-5 w-80 bg-muted/30 rounded" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-card border border-border rounded-xl p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-muted/40" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-16 bg-muted/50 rounded" />
              <div className="h-4 w-24 bg-muted/30 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Doctors management skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 mb-12 space-y-4">
        <div className="h-7 w-48 bg-muted/50 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

