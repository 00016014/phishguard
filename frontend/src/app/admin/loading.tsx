export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="h-10 bg-surface rounded-lg w-1/4" />
        <div className="flex gap-2 mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-surface rounded-lg w-24" />
          ))}
        </div>
        <div className="h-96 bg-surface rounded-xl" />
      </div>
    </div>
  );
}
