"use client";

import { useState } from "react";
import type { CapsuleEntry, EntryStatus, PeriodLevel } from "@/lib/capsule/types";

const CATEGORIES = [
  "meme", "viral_moment", "news", "tech", "gaming", "music",
  "movie_tv", "internet_drama", "opinion", "comment",
];

type EntryFormProps = {
  entry?: CapsuleEntry;
  onSaved?: () => void;
};

export function EntryForm({ entry, onSaved }: EntryFormProps) {
  const [form, setForm] = useState({
    title: entry?.title ?? "",
    description: entry?.description ?? "",
    category: entry?.category ?? "meme",
    tags: (entry?.tags ?? []).join(", "),
    source_name: entry?.source_name ?? "",
    source_url: entry?.source_url ?? "",
    image_url: entry?.image_url ?? "",
    image_alt: entry?.image_alt ?? "",
    period_start: entry?.period_start ?? "2020-03-01",
    period_end: entry?.period_end ?? "2020-03-31",
    period_granularity: entry?.period_granularity ?? "month",
    status: entry?.status ?? "draft",
    featured: entry?.featured ?? false,
    seo_title: entry?.seo_title ?? "",
    seo_description: entry?.seo_description ?? "",
    editorial_note: entry?.editorial_note ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const url = entry ? `/api/admin/entries/${entry.id}` : "/api/admin/entries";
    const method = entry ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl font-sans">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="w-full border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full border px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as EntryStatus })}
            className="w-full border px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Source name</label>
          <input
            value={form.source_name}
            onChange={(e) => setForm({ ...form, source_name: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source URL</label>
          <input
            value={form.source_url}
            onChange={(e) => setForm({ ...form, source_url: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image alt text</label>
          <input
            value={form.image_alt}
            onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Period start</label>
          <input
            type="date"
            value={form.period_start}
            onChange={(e) => setForm({ ...form, period_start: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Period end</label>
          <input
            type="date"
            value={form.period_end}
            onChange={(e) => setForm({ ...form, period_end: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Granularity</label>
          <select
            value={form.period_granularity}
            onChange={(e) => setForm({ ...form, period_granularity: e.target.value as PeriodLevel })}
            className="w-full border px-3 py-2"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SEO title</label>
          <input
            value={form.seo_title}
            onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO description</label>
          <input
            value={form.seo_description}
            onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
            className="w-full border px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Editorial note (admin only)</label>
        <textarea
          value={form.editorial_note}
          onChange={(e) => setForm({ ...form, editorial_note: e.target.value })}
          rows={2}
          className="w-full border px-3 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
        />
        Featured entry
      </label>
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-[var(--color-ink)] text-white px-6 py-2 text-sm disabled:opacity-50"
      >
        {saving ? "Saving…" : entry ? "Update entry" : "Create entry"}
      </button>
    </form>
  );
}
