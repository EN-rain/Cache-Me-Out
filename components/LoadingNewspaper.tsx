export function LoadingNewspaper() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-[var(--color-rule)] w-1/2 mx-auto mb-8" />
      <div className="h-12 bg-[var(--color-rule)] w-3/4 mx-auto mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-[var(--color-rule)] w-1/3" />
            <div className="h-3 bg-[var(--color-rule)]" />
            <div className="h-3 bg-[var(--color-rule)] w-5/6" />
            <div className="h-3 bg-[var(--color-rule)] w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
