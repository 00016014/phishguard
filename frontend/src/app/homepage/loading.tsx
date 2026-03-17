export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
        <div className="h-96 bg-surface rounded-xl" />
        <div className="h-48 bg-surface rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
