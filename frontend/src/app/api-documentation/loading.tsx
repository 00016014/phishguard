export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="h-10 bg-surface rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-surface rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-surface rounded-lg" />
      </div>
    </div>
  );
}
