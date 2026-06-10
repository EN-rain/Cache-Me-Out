"use client";

import { useState } from "react";
import type { CapsuleResponse } from "@/lib/capsule/types";
import { CapsulePreview } from "@/components/admin/CapsulePreview";

export default function PreviewPage() {
  const [period, setPeriod] = useState("2020-03");
  const [level, setLevel] = useState<"month" | "day" | "year">("month");
  const [capsule, setCapsule] = useState<CapsuleResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, level }),
    });

    if (res.ok) {
      setCapsule(await res.json());
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Period Preview</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Desktop-only preview with DRAFT PREVIEW watermark. Includes published + pending drafts.
      </p>
      <form onSubmit={handlePreview} className="flex gap-4 mb-8">
        <input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border px-3 py-2"
          placeholder="2020-03"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof level)}
          className="border px-3 py-2"
        >
          <option value="year">Year</option>
          <option value="month">Month</option>
          <option value="day">Day</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-ink)] text-white px-6 py-2 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Preview"}
        </button>
      </form>
      {capsule && <CapsulePreview capsule={capsule} />}
    </div>
  );
}
