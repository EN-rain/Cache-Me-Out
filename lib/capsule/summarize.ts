import type { CapsuleEntry, Confidence } from "./types";
import { formatPeriodLabel } from "./period";
import type { PeriodLevel } from "./types";

const CULTURE_CATEGORIES = new Set(["meme", "viral_moment", "gaming", "music", "movie_tv"]);
const EVENT_CATEGORIES = new Set(["news", "tech", "internet_drama"]);
const DISCUSSION_CATEGORIES = new Set(["comment", "internet_drama"]);
const OPINION_CATEGORIES = new Set(["opinion", "comment"]);

export function categorizeEntries(entries: CapsuleEntry[]) {
  return {
    culture: entries.filter((e) => CULTURE_CATEGORIES.has(e.category)),
    events: entries.filter((e) => EVENT_CATEGORIES.has(e.category)),
    discussion: entries.filter((e) => DISCUSSION_CATEGORIES.has(e.category)),
    opinions: entries.filter((e) => OPINION_CATEGORIES.has(e.category) || e.opinion),
  };
}

export function buildHeadline(entries: CapsuleEntry[], period: string, level: PeriodLevel): string {
  if (entries.length === 0) {
    return `The internet in ${formatPeriodLabel(period, level)}`;
  }
  const top = entries[0];
  return top.title;
}

export function buildSummary(entries: CapsuleEntry[], period: string, level: PeriodLevel): string {
  const label = formatPeriodLabel(period, level);
  if (entries.length === 0) {
    return `${label} is still being archived. Check back as more reviewed moments are published.`;
  }

  const categories = [...new Set(entries.slice(0, 5).map((e) => e.category))];
  const categoryLabels = categories
    .slice(0, 3)
    .map((c) => c.replace(/_/g, " "))
    .join(", ");

  return `${label} online attention was shaped by ${categoryLabels} — a mix of globally shared memes, platform shifts, and the stories people could not stop talking about.`;
}

export function computeConfidence(count: number): Confidence {
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
}
