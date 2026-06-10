import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="mb-6 text-sm text-[var(--color-muted)]" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.label}>
          {i > 0 && <span className="mx-2">/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-[var(--color-accent)] underline">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
