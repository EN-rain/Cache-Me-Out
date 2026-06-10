"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CapsuleDraft } from "@/lib/capsule/types";
import { DraftReviewTable } from "@/components/admin/DraftReviewTable";

export function ReviewClient() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(searchParams.get("period") ?? "2020-03");
  const [drafts, setDrafts] = useState<CapsuleDraft[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/drafts?period=${encodeURIComponent(period)}`);
    if (res.ok) setDrafts(await res.json());
    setLoading(false);
  }

  useEffect(() => { void load(); }, [period]);

  async function handleReview(id: string, status: string) {
    await fetch(`/api/admin/drafts/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_status: status }),
    });
    load();
  }

  async function handlePublish(id: string) {
    const level = period.split("-").length === 3 ? "day" : period === "2020" ? "year" : "month";
    await fetch(`/api/admin/drafts/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", period, level }),
    });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Period</label>
        <input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border px-3 py-2 w-48"
        />
        <button onClick={load} className="ml-2 border px-4 py-2 text-sm">Load</button>
      </div>
      {loading ? <p>Loading…</p> : (
        <DraftReviewTable drafts={drafts} onReview={handleReview} onPublish={handlePublish} />
      )}
    </div>
  );
}
