import { getSupabase } from "@/lib/db/supabase";
import type { PeriodLevel, PeriodSeo } from "@/lib/capsule/types";
import { parsePeriodKey } from "@/lib/capsule/period";
import { logAdminAction } from "./audit";

export type PeriodSeoInput = {
  period_key: string;
  level: PeriodLevel;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
};

export async function getPeriodSeo(periodKey: string): Promise<PeriodSeo | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("period_seo")
    .select("*")
    .eq("period_key", periodKey)
    .single();

  if (error) return null;
  return data as PeriodSeo;
}

export async function upsertPeriodSeo(input: PeriodSeoInput): Promise<PeriodSeo> {
  const parsed = parsePeriodKey(input.period_key, input.level);
  if (!parsed.valid) throw new Error("Invalid 2020 period");

  const payload = {
    period_key: parsed.periodKey,
    level: input.level,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    canonical_url: input.canonical_url || null,
    og_image_url: input.og_image_url || null,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("period_seo")
    .upsert(payload, { onConflict: "period_key" })
    .select()
    .single();

  if (error) throw error;
  await logAdminAction("upsert_period_seo", "period_seo", parsed.periodKey);
  return data as PeriodSeo;
}
