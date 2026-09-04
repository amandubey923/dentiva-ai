// Voice page loading skeleton
export default function VoiceLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-20 animate-pulse">
      <div className="text-center mb-8">
        <div className="h-9 w-80 bg-muted/50 rounded-lg mx-auto mb-2" />
        <div className="h-5 w-96 bg-muted/30 rounded mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="aspect-video bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
          <div className="size-24 rounded-full bg-muted/40" />
          <div className="h-6 w-32 bg-muted/50 rounded" />
          <div className="h-4 w-24 bg-muted/30 rounded" />
        </div>
        <div className="aspect-video bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
          <div className="size-24 rounded-full bg-muted/40" />
          <div className="h-6 w-20 bg-muted/50 rounded" />
          <div className="h-4 w-24 bg-muted/30 rounded" />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-48 h-12 bg-primary/30 rounded-3xl" />
      </div>
    </div>
  );
}

