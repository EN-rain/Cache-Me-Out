import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cache Me Outside — Admin</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Desktop-only content management for the 2020 archive.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/entries" className="border border-[var(--color-rule)] p-6 hover:border-[var(--color-accent)]">
          <h2 className="font-bold">Entries</h2>
          <p className="text-sm text-[var(--color-muted)] mt-2">Manage published, draft, and archived entries.</p>
        </Link>
        <Link href="/admin/generator" className="border border-[var(--color-rule)] p-6 hover:border-[var(--color-accent)]">
          <h2 className="font-bold">Generator</h2>
          <p className="text-sm text-[var(--color-muted)] mt-2">Create drafts from curated 2020 seed data.</p>
        </Link>
        <Link href="/admin/review" className="border border-[var(--color-rule)] p-6 hover:border-[var(--color-accent)]">
          <h2 className="font-bold">Review</h2>
          <p className="text-sm text-[var(--color-muted)] mt-2">Audit generated drafts before publishing.</p>
        </Link>
        <Link href="/admin/preview" className="border border-[var(--color-rule)] p-6 hover:border-[var(--color-accent)]">
          <h2 className="font-bold">Preview</h2>
          <p className="text-sm text-[var(--color-muted)] mt-2">Preview period pages with draft content.</p>
        </Link>
      </div>
    </div>
  );
}
