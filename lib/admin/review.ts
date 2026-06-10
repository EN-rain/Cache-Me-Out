import { getSupabase } from "@/lib/db/supabase";
import type { CapsuleDraft, DraftReviewStatus } from "@/lib/capsule/types";
import { logAdminAction } from "./audit";

export async function listDrafts(periodKey?: string): Promise<CapsuleDraft[]> {
  const supabase = getSupabase();
  let query = supabase.from("capsule_drafts").select("*").order("created_at", { ascending: false });
  if (periodKey) query = query.eq("period_key", periodKey);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CapsuleDraft[];
}

export async function updateDraftReview(
  id: string,
  reviewStatus: DraftReviewStatus,
  reviewNote?: string
): Promise<CapsuleDraft> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("capsule_drafts")
    .update({
      review_status: reviewStatus,
      review_note: reviewNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await logAdminAction("review_draft", "capsule_draft", id, { reviewStatus });
  return data as CapsuleDraft;
}

export async function publishDraftAsEntry(draftId: string): Promise<string> {
  const supabase = getSupabase();
  const { data: draft, error } = await supabase
    .from("capsule_drafts")
    .select("*")
    .eq("id", draftId)
    .single();

  if (error || !draft) throw new Error("Draft not found");

  const normalized = (draft.normalized_data ?? draft.raw_data) as Record<string, unknown>;

  const { data: entry, error: insertError } = await supabase
    .from("capsule_entries")
    .insert({
      title: String(normalized.title ?? "Untitled"),
      description: normalized.description ? String(normalized.description) : null,
      source_name: normalized.source_name ? String(normalized.source_name) : null,
      source_url: normalized.source_url ? String(normalized.source_url) : null,
      image_url: normalized.image_url ? String(normalized.image_url) : null,
      image_alt: normalized.image_alt ? String(normalized.image_alt) : null,
      image_source_url: normalized.image_source_url ? String(normalized.image_source_url) : null,
      image_license: normalized.image_license ? String(normalized.image_license) : null,
      category: String(normalized.category ?? "meme"),
      tags: Array.isArray(normalized.tags) ? normalized.tags : [],
      period_start: String(normalized.period_start),
      period_end: normalized.period_end ? String(normalized.period_end) : null,
      period_granularity: String(normalized.period_granularity ?? draft.level),
      origin: "generated_draft",
      confidence: String(normalized.confidence ?? "medium"),
      status: "published",
      slug: normalized.slug ? String(normalized.slug) : null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  await supabase
    .from("capsule_drafts")
    .update({ review_status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", draftId);

  await logAdminAction("publish_draft", "capsule_draft", draftId, { entryId: entry.id });
  return entry.id as string;
}
