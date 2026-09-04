// Appointments loading.tsx
export default function AppointmentsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-24 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted/50 rounded-lg mb-2" />
        <div className="h-5 w-80 bg-muted/30 rounded" />
      </div>

      {/* Progress steps skeleton */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted/50" />
            <div className="h-4 w-24 bg-muted/30 rounded hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Doctor cards skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-full bg-muted/40 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-muted/50 rounded" />
                <div className="h-4 w-24 bg-muted/30 rounded" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-muted/20 rounded" />
              <div className="h-4 w-3/4 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

