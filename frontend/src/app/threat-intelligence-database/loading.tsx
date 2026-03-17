export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-surface rounded-lg w-1/3" />
          <div className="h-10 bg-surface rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg" />
          ))}
        </div>
        <div className="h-12 bg-surface rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-96 bg-surface rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
