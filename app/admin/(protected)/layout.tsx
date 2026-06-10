import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/session";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans">
      <header className="border-b border-[var(--color-rule)] px-6 py-4">
        <nav className="flex gap-6 text-sm">
          <Link href="/admin" className="font-bold hover:text-[var(--color-accent)]">Dashboard</Link>
          <Link href="/admin/entries" className="hover:text-[var(--color-accent)]">Entries</Link>
          <Link href="/admin/entries/new" className="hover:text-[var(--color-accent)]">New Entry</Link>
          <Link href="/admin/generator" className="hover:text-[var(--color-accent)]">Generator</Link>
          <Link href="/admin/review" className="hover:text-[var(--color-accent)]">Review</Link>
          <Link href="/admin/preview" className="hover:text-[var(--color-accent)]">Preview</Link>
        </nav>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
