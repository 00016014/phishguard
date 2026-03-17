export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg" />
          ))}
        </div>
        <div className="h-16 bg-surface rounded-lg" />
        <div className="h-64 bg-surface rounded-lg" />
      </div>
    </div>
  );
}
