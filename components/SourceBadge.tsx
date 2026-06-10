type SourceBadgeProps = {
  managed?: boolean;
  curated?: boolean;
  generated?: boolean;
};

export function SourceBadge({ managed, curated, generated }: SourceBadgeProps) {
  const badges: string[] = [];
  if (managed) badges.push("Managed");
  if (curated) badges.push("Curated");
  if (generated) badges.push("Generated draft");

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {badges.map((badge) => (
        <span
          key={badge}
          className="border border-[var(--color-rule)] px-2 py-0.5 uppercase tracking-wide text-[var(--color-muted)]"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
