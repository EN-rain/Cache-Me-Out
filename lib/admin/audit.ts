import { getSupabase } from "@/lib/db/supabase";

export async function logAdminAction(
  action: string,
  targetType: string,
  targetId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from("admin_audit_log").insert({
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      metadata,
    });
  } catch (error) {
    console.error("[audit] Failed to log action:", action, error);
  }
}
