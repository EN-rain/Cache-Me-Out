"use client";

import Link from "next/link";
import type { CapsuleEntry } from "@/lib/capsule/types";

type EntryTableProps = {
  entries: CapsuleEntry[];
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
};

export function EntryTable({ entries, onPublish, onArchive }: EntryTableProps) {
  if (entries.length === 0) {
    return <p className="text-[var(--color-muted)] font-sans">No entries found.</p>;
  }

  return (
    <div className="overflow-x-auto font-sans">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Period</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-[var(--color-rule)]">
              <td className="py-3 pr-4">
                <Link href={`/admin/entries/${entry.id}`} className="hover:underline font-medium">
                  {entry.title}
                </Link>
              </td>
              <td className="py-3 pr-4 text-[var(--color-muted)]">{entry.period_start}</td>
              <td className="py-3 pr-4">{entry.category}</td>
              <td className="py-3 pr-4">
                <span className={`uppercase text-xs tracking-wide ${
                  entry.status === "published" ? "text-green-800" :
                  entry.status === "archived" ? "text-[var(--color-muted)]" : "text-amber-800"
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="py-3 space-x-2">
                {entry.status !== "published" && onPublish && (
                  <button
                    onClick={() => onPublish(entry.id)}
                    className="text-xs underline hover:text-[var(--color-accent)]"
                  >
                    Publish
                  </button>
                )}
                {entry.status === "published" && onArchive && (
                  <button
                    onClick={() => onArchive(entry.id)}
                    className="text-xs underline hover:text-[var(--color-accent)]"
                  >
                    Archive
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
