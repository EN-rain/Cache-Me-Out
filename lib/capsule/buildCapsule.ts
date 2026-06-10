import type { CapsuleEntry, CapsuleItem, CapsuleResponse, PeriodLevel } from "./types";
import { parsePeriodKey } from "./period";
import { rankEntries } from "./rankItems";
import {
  buildHeadline,
  buildSummary,
  categorizeEntries,
  computeConfidence,
} from "./summarize";

function entryToItem(entry: CapsuleEntry): CapsuleItem {
  return {
    title: entry.title,
    description: entry.description ?? undefined,
    url: entry.url ?? entry.source_url ?? undefined,
    imageUrl: entry.image_url ?? undefined,
    imageAlt: entry.image_alt ?? undefined,
    origin: entry.origin,
    category: entry.category,
    source: entry.source_name ?? "Reviewed archive",
  };
}

export function buildCapsule(
  period: string,
  level: PeriodLevel,
  entries: CapsuleEntry[],
  includeDrafts = false
): CapsuleResponse | null {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) return null;

  const filtered = entries.filter((e) => {
    if (!includeDrafts && e.status !== "published") return false;
    if (includeDrafts && e.status === "archived") return false;

    const entryDate = e.period_start;
    return entryDate >= parsed.periodStart && entryDate <= parsed.periodEnd;
  });

  const ranked = rankEntries(filtered);
  const sections = categorizeEntries(ranked);

  const origins = new Set(ranked.map((e) => e.origin));

  return {
    period,
    level,
    headline: buildHeadline(ranked, period, level),
    summary: buildSummary(ranked, period, level),
    confidence: computeConfidence(ranked.length),
    sections: {
      culture: sections.culture.map(entryToItem),
      events: sections.events.map(entryToItem),
      discussion: sections.discussion.map(entryToItem),
      opinions: sections.opinions.map(entryToItem),
    },
    sources: {
      managed: origins.has("manual"),
      curated: origins.has("curated_seed"),
      generated: origins.has("generated_draft"),
    },
  };
}
