"use client";

import { useState } from "react";
import type { PeriodLevel } from "@/lib/capsule/types";

export default function PeriodSeoPage() {
  const [form, setForm] = useState({
    period_key: "2020-03",
    level: "month" as PeriodLevel,
    seo_title: "",
    seo_description: "",
    canonical_url: "",
    og_image_url: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setMessage("");
    const res = await fetch(`/api/admin/seo?period=${encodeURIComponent(form.period_key)}`);
    if (!res.ok) {
      setMessage("Could not load SEO override.");
      return;
    }

    const data = await res.json();
    if (!data) {
      setMessage("No override exists for this period yet.");
      return;
    }

    setForm({
      period_key: data.period_key,
      level: data.level,
      seo_title: data.seo_title ?? "",
      seo_description: data.seo_description ?? "",
      canonical_url: data.canonical_url ?? "",
      og_image_url: data.og_image_url ?? "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Save failed");
      return;
    }

    setMessage("SEO override saved.");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Period SEO</h1>
      <form onSubmit={save} className="space-y-4 max-w-2xl font-sans">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Period</label>
            <input
              value={form.period_key}
              onChange={(e) => setForm({ ...form, period_key: e.target.value })}
              className="w-full border px-3 py-2"
              placeholder="2020, 2020-03, or 2020-03-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as PeriodLevel })}
              className="w-full border px-3 py-2"
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>
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
          <textarea
            value={form.seo_description}
            onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
            rows={3}
            className="w-full border px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Canonical URL</label>
            <input
              value={form.canonical_url}
              onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
              className="w-full border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Open Graph image URL</label>
            <input
              value={form.og_image_url}
              onChange={(e) => setForm({ ...form, og_image_url: e.target.value })}
              className="w-full border px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={load} className="border px-4 py-2 text-sm">
            Load override
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-ink)] text-white px-6 py-2 text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save SEO"}
          </button>
        </div>
        {message && <p className="text-sm text-[var(--color-muted)]">{message}</p>}
      </form>
    </div>
  );
}
