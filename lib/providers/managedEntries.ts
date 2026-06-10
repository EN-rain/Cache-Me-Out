import { getSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import type { CapsuleEntry, EntryStatus } from "@/lib/capsule/types";
import type { PeriodLevel } from "@/lib/capsule/types";
import { parsePeriodKey } from "@/lib/capsule/period";

export async function getPublishedEntriesForPeriod(
  period: string,
  level: PeriodLevel
): Promise<CapsuleEntry[]> {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) return [];
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_entries")
    .select("*")
    .eq("status", "published")
    .gte("period_start", parsed.periodStart)
    .lte("period_start", parsed.periodEnd)
    .order("featured", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CapsuleEntry[];
}

export async function getEntriesForPeriod(
  period: string,
  level: PeriodLevel,
  statuses: EntryStatus[] = ["published"]
): Promise<CapsuleEntry[]> {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) return [];
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_entries")
    .select("*")
    .in("status", statuses)
    .gte("period_start", parsed.periodStart)
    .lte("period_start", parsed.periodEnd);

  if (error) throw error;
  return (data ?? []) as CapsuleEntry[];
}

export async function getFeaturedEntryForPeriod(
  period: string,
  level: PeriodLevel
): Promise<CapsuleEntry | null> {
  const entries = await getPublishedEntriesForPeriod(period, level);
  return entries.find((e) => e.featured) ?? entries[0] ?? null;
}
