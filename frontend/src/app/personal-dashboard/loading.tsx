export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="h-10 bg-surface rounded-lg w-1/4" />
        <div className="h-48 bg-surface rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 bg-surface rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
