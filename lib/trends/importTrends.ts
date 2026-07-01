import { getSupabase } from "@/lib/db/supabase";
import type { PeriodLevel } from "@/lib/capsule/types";
import { formatPeriodLabel, parsePeriodKey } from "@/lib/capsule/period";
import { fetchWikimediaTrendSignal } from "./wikimedia";
import { fetchGdeltTrendSignal } from "./gdelt";
import { trendDateRange } from "./dates";

type SourceSignal = {
  source: string;
  query: string;
  score: number;
  rawData: Record<string, unknown>;
};

export type ImportTrendsInput = {
  period: string;
  level: PeriodLevel;
  keywords: string[];
  includeGdelt?: boolean;
};

export type ImportTrendsResult = {
  signals: number;
  created: number;
  drafts: string[];
};

function normalizeKeywords(keywords: string[]): string[] {
  return [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].slice(0, 12);
}

function draftFromSignals(
  query: string,
  signals: SourceSignal[],
  period: string,
  level: PeriodLevel
): Record<string, unknown> {
  const parsed = parsePeriodKey(period, level);
  const wiki = signals.find((signal) => signal.source === "wikimedia");
  const gdelt = signals.find((signal) => signal.source === "gdelt");
  const views = Number(wiki?.rawData.views ?? 0);
  const articleCount = Number(gdelt?.rawData.article_count ?? 0);
  const signalNotes = [
    views > 0 ? `${views.toLocaleString()} Wikimedia pageviews` : null,
    articleCount > 0 ? `${articleCount} GDELT article matches` : null,
  ].filter(Boolean);

  return {
    title: `${query} trends in ${formatPeriodLabel(period, level)}`,
    description: signalNotes.length > 0
      ? `Imported trend candidate based on ${signalNotes.join(" and ")}. Review relevance, dates, images, and source links before publishing.`
      : "Imported trend candidate with weak external signal. Review carefully before publishing.",
    source_name: "Trend importer",
    source_url: wiki?.rawData.url ?? gdelt?.rawData.url ?? null,
    image_url: null,
    image_alt: query,
    image_source_url: null,
    image_license: null,
    category: "viral_moment",
    tags: [
      "trend-signal",
      ...query.toLowerCase().split(/\s+/).map((part) => part.replace(/[^a-z0-9-]/g, "")).filter(Boolean),
    ],
    period_start: parsed.periodStart,
    period_end: parsed.periodEnd,
    period_granularity: level,
    origin: "generated_draft",
    confidence: signals.some((signal) => signal.score > 0) ? "medium" : "low",
    slug: query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80),
  };
}

export async function importTrendDrafts(input: ImportTrendsInput): Promise<ImportTrendsResult> {
  const range = trendDateRange(input.period, input.level);
  if (!range.valid) throw new Error("Invalid 2020 period");

  const keywords = normalizeKeywords(input.keywords);
  if (keywords.length === 0) throw new Error("At least one keyword is required");

  const supabase = getSupabase();
  const draftIds: string[] = [];
  let signalCount = 0;

  for (const keyword of keywords) {
    const signals: SourceSignal[] = [
      await fetchWikimediaTrendSignal(keyword, range.start, range.end),
    ];

    if (input.includeGdelt) {
      signals.push(await fetchGdeltTrendSignal(keyword, range.start, range.end));
    }

    for (const signal of signals) {
      const { error } = await supabase.from("trend_signals").insert({
        period_key: range.periodKey,
        source: signal.source,
        query: signal.query,
        score: signal.score,
        raw_data: signal.rawData,
      });
      if (error) throw error;
      signalCount++;
    }

    const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
    const normalized = draftFromSignals(keyword, signals, range.periodKey, input.level);
    const { data, error } = await supabase
      .from("capsule_drafts")
      .insert({
        period_key: range.periodKey,
        level: input.level,
        generator_name: "trend-importer",
        raw_data: {
          keyword,
          total_score: totalScore,
          sources: signals.map((signal) => signal.source),
        },
        normalized_data: normalized,
        review_status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    draftIds.push(data.id);
  }

  return {
    signals: signalCount,
    created: draftIds.length,
    drafts: draftIds,
  };
}
