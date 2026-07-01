import { compactDate } from "./dates";

export type GdeltTrendSignal = {
  source: "gdelt";
  query: string;
  score: number;
  rawData: Record<string, unknown>;
};

type GdeltArticle = {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
};

export function gdeltDocUrl(query: string, start: string, end: string): string {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    maxrecords: "10",
    sort: "hybridrel",
    startdatetime: `${compactDate(start)}000000`,
    enddatetime: `${compactDate(end)}235959`,
  });

  return `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
}

export async function fetchGdeltTrendSignal(
  query: string,
  start: string,
  end: string
): Promise<GdeltTrendSignal> {
  const url = gdeltDocUrl(query, start, end);
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    return {
      source: "gdelt",
      query,
      score: 0,
      rawData: { status: res.status, url },
    };
  }

  const data = await res.json() as { articles?: GdeltArticle[] };
  const articles = data.articles ?? [];

  return {
    source: "gdelt",
    query,
    score: articles.length * 1000,
    rawData: {
      url,
      article_count: articles.length,
      articles: articles.slice(0, 5),
    },
  };
}
