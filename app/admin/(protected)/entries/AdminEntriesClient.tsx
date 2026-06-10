"use client";

import { useEffect, useState } from "react";
import type { CapsuleEntry } from "@/lib/capsule/types";
import { EntryTable } from "@/components/admin/EntryTable";

export function AdminEntriesClient() {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/entries?${params}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function handlePublish(id: string) {
    await fetch(`/api/admin/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    load();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/admin/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    load();
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="border px-3 py-2 text-sm flex-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={load} className="border px-4 py-2 text-sm">Filter</button>
      </div>
      {loading ? <p>Loading…</p> : (
        <EntryTable entries={entries} onPublish={handlePublish} onArchive={handleArchive} />
      )}
    </div>
  );
}
