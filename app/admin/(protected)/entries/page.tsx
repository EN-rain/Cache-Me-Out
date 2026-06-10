import Link from "next/link";
import { AdminEntriesClient } from "./AdminEntriesClient";

export default function AdminEntriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entries</h1>
        <Link href="/admin/entries/new" className="bg-[var(--color-ink)] text-white px-4 py-2 text-sm">
          New entry
        </Link>
      </div>
      <AdminEntriesClient />
    </div>
  );
}
