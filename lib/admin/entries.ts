import { getSupabase } from "@/lib/db/supabase";
import type { CapsuleEntry, EntryStatus } from "@/lib/capsule/types";
import { validateEntryPeriod } from "@/lib/capsule/period";
import { logAdminAction } from "./audit";

export type EntryFilters = {
  status?: EntryStatus;
  category?: string;
  source?: string;
  search?: string;
  period?: string;
};

export async function listEntries(filters: EntryFilters = {}): Promise<CapsuleEntry[]> {
  const supabase = getSupabase();
  let query = supabase.from("capsule_entries").select("*").order("period_start", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.period) query = query.eq("period_start", filters.period);
  if (filters.source) query = query.ilike("source_name", `%${filters.source}%`);
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CapsuleEntry[];
}

export async function getEntry(id: string): Promise<CapsuleEntry | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_entries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as CapsuleEntry;
}

export async function createEntry(
  input: Partial<CapsuleEntry> & { title: string; category: string; period_start: string; period_granularity: CapsuleEntry["period_granularity"] }
): Promise<CapsuleEntry> {
  const periodError = validateEntryPeriod(
    input.period_start,
    input.period_end ?? null,
    input.period_granularity
  );
  if (periodError) throw new Error(periodError);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_entries")
    .insert({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  await logAdminAction("create_entry", "capsule_entry", data.id);
  return data as CapsuleEntry;
}

export async function updateEntry(
  id: string,
  input: Partial<CapsuleEntry>
): Promise<CapsuleEntry> {
  if (input.period_start && input.period_granularity) {
    const periodError = validateEntryPeriod(
      input.period_start,
      input.period_end ?? null,
      input.period_granularity
    );
    if (periodError) throw new Error(periodError);
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_entries")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await logAdminAction("update_entry", "capsule_entry", id, { fields: Object.keys(input) });
  return data as CapsuleEntry;
}

export async function publishEntry(id: string): Promise<CapsuleEntry> {
  return updateEntry(id, { status: "published" });
}

export async function archiveEntry(id: string): Promise<CapsuleEntry> {
  return updateEntry(id, { status: "archived" });
}
