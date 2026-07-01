import type { MetadataRoute } from "next";
import { monthNumberToSlug } from "@/lib/capsule/period";
import { buildPublicPath } from "@/lib/capsule/paths";
import { getSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import type { PeriodLevel } from "@/lib/capsule/types";

function periodKeyFromEntry(periodStart: string, level: PeriodLevel): string {
  if (level === "year") return "2020";
  if (level === "month") return periodStart.slice(0, 7);
  return periodStart;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/2020`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  for (let m = 1; m <= 12; m++) {
    const slug = monthNumberToSlug(m);
    entries.push({
      url: `${siteUrl}/2020/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("capsule_entries")
        .select("period_start, period_granularity, updated_at")
        .eq("status", "published");

      const seen = new Set(entries.map((entry) => entry.url));
      for (const row of data ?? []) {
        const level = row.period_granularity as PeriodLevel;
        const period = periodKeyFromEntry(row.period_start, level);
        const url = `${siteUrl}${buildPublicPath(period, level)}`;
        if (seen.has(url)) continue;
        seen.add(url);
        entries.push({
          url,
          lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: level === "day" ? 0.6 : 0.8,
        });
      }
    } catch {
      // Static routes above are still useful when the database is unavailable.
    }
  }

  return entries;
}
