export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-72 bg-surface-container rounded-lg" />
      <div className="h-5 w-96 max-w-full bg-surface-container-low rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 bg-surface-container-low rounded-xl border border-outline-variant/20" />
        ))}
      </div>
    </div>
  );
}