"use client";

import { useCallback, useEffect, useState } from "react";
import type { CapsuleEntry } from "@/lib/capsule/types";
import { EntryTable } from "@/components/admin/EntryTable";

export function AdminEntriesClient() {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (source) params.set("source", source);
    if (period) params.set("period", period);

    const res = await fetch(`/api/admin/entries?${params}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, [category, period, search, source, status]);

  useEffect(() => { void load(); }, [load]);

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="border px-3 py-2 text-sm md:col-span-2"
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
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="border px-3 py-2 text-sm"
        />
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source"
          className="border px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border px-3 py-2 text-sm"
        />
        <button onClick={load} className="border px-4 py-2 text-sm">Filter</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <EntryTable entries={entries} onPublish={handlePublish} onArchive={handleArchive} />
      )}
    </div>
  );
}
