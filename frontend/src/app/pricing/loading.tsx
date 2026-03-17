export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-card border-b border-border" />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <div className="h-12 bg-surface rounded-lg w-1/3 mx-auto" />
        <div className="h-6 bg-surface rounded-lg w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
