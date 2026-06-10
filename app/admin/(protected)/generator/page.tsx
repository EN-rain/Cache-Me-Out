"use client";

import { useState } from "react";

export default function GeneratorPage() {
  const [period, setPeriod] = useState("2020-03");
  const [level, setLevel] = useState<"month" | "day" | "year">("month");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, level, notes: notes || undefined }),
    });

    const data = await res.json();
    if (res.ok) {
      setResult(`Created ${data.created} draft(s). Review them before publishing.`);
    } else {
      setResult(data.error ?? "Generation failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Draft Generator</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Generates drafts from curated-2020.json only. Never publishes directly.
      </p>
      <form onSubmit={handleGenerate} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Period (e.g. 2020-03 or 2020-03-20)</label>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            className="w-full border px-3 py-2"
          >
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="day">Day</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Admin notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-ink)] text-white px-6 py-2 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate drafts"}
        </button>
      </form>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
