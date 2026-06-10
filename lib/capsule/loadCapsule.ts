import { buildCapsule } from "./buildCapsule";
import type { CapsuleResponse, PeriodLevel } from "./types";
import { getPublishedEntriesForPeriod } from "@/lib/providers/managedEntries";
import { getCuratedItemsForPeriod } from "@/lib/providers/curated2020";
import { parsePeriodKey } from "./period";
import { normalizeDraft } from "@/lib/generator/normalizeDraft";
import type { CapsuleEntry } from "./types";

function curatedFallbackEntries(period: string, level: PeriodLevel): CapsuleEntry[] {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) return [];

  const items = getCuratedItemsForPeriod(parsed.periodKey);
  return items.map((item, i) => {
    const normalized = normalizeDraft(item, parsed.periodKey, level);
    return {
      id: `curated-${i}`,
      title: String(normalized.title),
      description: normalized.description ? String(normalized.description) : null,
      url: null,
      source_name: normalized.source_name ? String(normalized.source_name) : null,
      source_url: normalized.source_url ? String(normalized.source_url) : null,
      image_url: normalized.image_url ? String(normalized.image_url) : null,
      image_alt: normalized.image_alt ? String(normalized.image_alt) : null,
      image_source_url: null,
      image_license: null,
      category: String(normalized.category),
      tags: (normalized.tags as string[]) ?? [],
      period_start: String(normalized.period_start),
      period_end: normalized.period_end ? String(normalized.period_end) : null,
      period_granularity: level,
      origin: "curated_seed" as const,
      confidence: (normalized.confidence as CapsuleEntry["confidence"]) ?? "medium",
      status: "published" as const,
      featured: i === 0,
      editorial_note: null,
      opinion: null,
      quote: null,
      seo_title: null,
      seo_description: null,
      slug: normalized.slug ? String(normalized.slug) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

export async function loadPublicCapsule(
  period: string,
  level: PeriodLevel
): Promise<CapsuleResponse | null> {
  let entries: CapsuleEntry[] = [];

  try {
    entries = await getPublishedEntriesForPeriod(period, level);
  } catch {
    entries = curatedFallbackEntries(period, level);
  }

  if (entries.length === 0) {
    entries = curatedFallbackEntries(period, level);
  }

  return buildCapsule(period, level, entries, false);
}
