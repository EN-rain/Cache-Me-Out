import type { CapsuleEntry } from "./types";

const CATEGORY_SIGNAL: Record<string, number> = {
  viral_moment: 10,
  meme: 9,
  internet_drama: 8,
  news: 7,
  tech: 6,
  gaming: 6,
  music: 5,
  movie_tv: 5,
  opinion: 4,
  comment: 3,
};

function dedupeKey(entry: CapsuleEntry): string {
  return entry.title.toLowerCase().trim();
}

export function rankEntries(entries: CapsuleEntry[]): CapsuleEntry[] {
  const seen = new Set<string>();

  return [...entries]
    .sort((a, b) => {
      const scoreA =
        (a.featured ? 100 : 0) +
        (CATEGORY_SIGNAL[a.category] ?? 0) +
        (a.confidence === "high" ? 5 : a.confidence === "medium" ? 2 : 0) +
        (a.origin === "manual" ? 3 : a.origin === "curated_seed" ? 2 : 1);
      const scoreB =
        (b.featured ? 100 : 0) +
        (CATEGORY_SIGNAL[b.category] ?? 0) +
        (b.confidence === "high" ? 5 : b.confidence === "medium" ? 2 : 0) +
        (b.origin === "manual" ? 3 : b.origin === "curated_seed" ? 2 : 1);
      return scoreB - scoreA;
    })
    .filter((entry) => {
      const key = dedupeKey(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
