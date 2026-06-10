import { getSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import type { PeriodLevel } from "@/lib/capsule/types";
import { formatPeriodLabel } from "@/lib/capsule/period";
import { buildPublicPath } from "@/lib/capsule/paths";
import { getFeaturedEntryForPeriod } from "@/lib/providers/managedEntries";

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
};

export async function getPeriodMetadata(
  period: string,
  level: PeriodLevel
): Promise<PageMetadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const label = formatPeriodLabel(period, level);

  let seoTitle: string | null = null;
  let seoDescription: string | null = null;
  let canonical: string | null = null;
  let ogImage: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("period_seo")
        .select("*")
        .eq("period_key", period)
        .single();

      if (data) {
        seoTitle = data.seo_title;
        seoDescription = data.seo_description;
        canonical = data.canonical_url;
        ogImage = data.og_image_url;
      }
    } catch {
      // Fall through to featured entry
    }
  }

  if (!seoTitle || !seoDescription) {
    let featured = null;
    try {
      featured = await getFeaturedEntryForPeriod(period, level);
    } catch {
      featured = null;
    }
    if (featured) {
      seoTitle = seoTitle ?? featured.seo_title ?? featured.title;
      seoDescription =
        seoDescription ?? featured.seo_description ?? featured.description ?? featured.title;
      ogImage = ogImage ?? featured.image_url ?? null;
    }
  }

  const path = buildPublicPath(period, level);

  return {
    title: seoTitle ?? `Cache Me Outside — ${label}`,
    description:
      seoDescription ??
      `What was the internet paying attention to in ${label}? A reviewed 2020 time capsule.`,
    canonical: canonical ?? `${siteUrl}${path}`,
    ogImage: ogImage ?? undefined,
  };
}
