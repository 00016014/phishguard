export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-pulse">
      <div className="w-full max-w-md mx-4">
        <div className="h-12 bg-surface rounded-lg w-1/2 mx-auto mb-8" />
        <div className="h-96 bg-surface rounded-xl" />
      </div>
    </div>
  );
}
