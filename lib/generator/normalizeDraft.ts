import type { CuratedItem } from "@/lib/providers/curated2020";
import type { PeriodLevel } from "@/lib/capsule/types";
import { parsePeriodKey } from "@/lib/capsule/period";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function normalizeDraft(
  item: CuratedItem,
  periodKey: string,
  level: PeriodLevel
): Record<string, unknown> {
  const parsed = parsePeriodKey(periodKey, level);

  return {
    title: item.title,
    description: item.description ?? null,
    source_name: item.source_name ?? "Curated archive",
    source_url: item.source_url ?? null,
    image_url: item.image_url ?? null,
    image_alt: item.image_alt ?? item.title,
    image_source_url: item.image_source_url ?? item.source_url ?? null,
    image_license: item.image_license ?? null,
    category: item.category,
    tags: item.tags ?? [],
    period_start: parsed.periodStart,
    period_end: parsed.periodEnd,
    period_granularity: level,
    origin: "curated_seed",
    confidence: item.confidence ?? "medium",
    slug: slugify(item.title),
  };
}
