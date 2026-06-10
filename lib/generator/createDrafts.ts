import { getSupabase } from "@/lib/db/supabase";
import { parsePeriodKey } from "@/lib/capsule/period";
import type { PeriodLevel } from "@/lib/capsule/types";
import { getCuratedItemsForPeriod } from "@/lib/providers/curated2020";
import { normalizeDraft } from "./normalizeDraft";

export async function createDraftsForPeriod(
  period: string,
  level: PeriodLevel,
  adminNotes?: string
): Promise<{ created: number; drafts: string[] }> {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) throw new Error("Invalid 2020 period");

  const curated = getCuratedItemsForPeriod(parsed.periodKey);
  if (curated.length === 0 && !adminNotes) {
    throw new Error("No curated seed data for this period");
  }

  const supabase = getSupabase();
  const draftIds: string[] = [];

  for (const item of curated) {
    const normalized = normalizeDraft(item, parsed.periodKey, level);
    const { data, error } = await supabase
      .from("capsule_drafts")
      .insert({
        period_key: parsed.periodKey,
        level,
        generator_name: "curated-2020",
        raw_data: item,
        normalized_data: normalized,
        review_status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    draftIds.push(data.id);
  }

  if (adminNotes) {
    const normalized = normalizeDraft(
      {
        title: `Admin notes for ${parsed.periodKey}`,
        description: adminNotes,
        category: "comment",
        tags: ["admin-notes"],
        confidence: "medium",
      },
      parsed.periodKey,
      level
    );

    const { data, error } = await supabase
      .from("capsule_drafts")
      .insert({
        period_key: parsed.periodKey,
        level,
        generator_name: "admin-notes",
        raw_data: { notes: adminNotes },
        normalized_data: normalized,
        review_status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    draftIds.push(data.id);
  }

  return { created: draftIds.length, drafts: draftIds };
}
