"use client";

import { useState } from "react";
import type { PeriodLevel } from "@/lib/capsule/types";

export default function TrendImporterPage() {
  const [period, setPeriod] = useState("2020-03");
  const [level, setLevel] = useState<PeriodLevel>("month");
  const [keywords, setKeywords] = useState("Tiger King\nAnimal Crossing\nlockdown memes");
  const [includeGdelt, setIncludeGdelt] = useState(true);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/admin/import-trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, level, keywords, includeGdelt }),
    });

    const data = await res.json();
    if (res.ok) {
      setResult(`Created ${data.created} draft(s) from ${data.signals} trend signal(s). Review before publishing.`);
    } else {
      setResult(data.error ?? "Import failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trend Importer</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
        Imports historical trend signals into pending drafts. Public pages still only show approved entries.
      </p>
      <form onSubmit={handleImport} className="max-w-2xl space-y-4 font-sans">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Period</label>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border px-3 py-2"
              placeholder="2020, 2020-03, or 2020-03-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PeriodLevel)}
              className="w-full border px-3 py-2"
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Seed keywords</label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={8}
            className="w-full border px-3 py-2"
            placeholder="One keyword per line"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeGdelt}
            onChange={(e) => setIncludeGdelt(e.target.checked)}
          />
          Include GDELT article matches
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-ink)] text-white px-6 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import trend drafts"}
        </button>
      </form>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
