import { compactDate } from "./dates";

export type WikimediaTrendSignal = {
  source: "wikimedia";
  query: string;
  score: number;
  rawData: Record<string, unknown>;
};

type PageviewItem = {
  views?: number;
};

function trendUserAgent(): string {
  return process.env.TREND_IMPORT_USER_AGENT ?? "CacheMeOutside/0.1 admin-importer";
}

export function wikipediaArticleTitle(query: string): string {
  return query.trim().replace(/\s+/g, "_");
}

export function wikimediaPageviewsUrl(query: string, start: string, end: string): string {
  const title = encodeURIComponent(wikipediaArticleTitle(query));
  const startStamp = `${compactDate(start)}00`;
  const endStamp = `${compactDate(end)}00`;
  return `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/user/${title}/daily/${startStamp}/${endStamp}`;
}

export async function fetchWikimediaTrendSignal(
  query: string,
  start: string,
  end: string
): Promise<WikimediaTrendSignal> {
  const url = wikimediaPageviewsUrl(query, start, end);
  const res = await fetch(url, {
    headers: {
      "User-Agent": trendUserAgent(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return {
      source: "wikimedia",
      query,
      score: 0,
      rawData: { status: res.status, url },
    };
  }

  const data = await res.json() as { items?: PageviewItem[] };
  const views = (data.items ?? []).reduce((sum, item) => sum + (item.views ?? 0), 0);

  return {
    source: "wikimedia",
    query,
    score: views,
    rawData: {
      url,
      views,
      days: data.items?.length ?? 0,
    },
  };
}
