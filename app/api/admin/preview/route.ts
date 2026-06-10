import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { buildCapsule } from "@/lib/capsule/buildCapsule";
import type { PeriodLevel } from "@/lib/capsule/types";
import { getEntriesForPeriod } from "@/lib/providers/managedEntries";
import { listDrafts } from "@/lib/admin/review";
import { parsePeriodKey } from "@/lib/capsule/period";
import type { CapsuleEntry } from "@/lib/capsule/types";

export async function POST(request: NextRequest) {
  const blocked = await adminGuard(request);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { period, level, includeDraftIds } = body as {
      period: string;
      level: PeriodLevel;
      includeDraftIds?: string[];
    };

    const parsed = parsePeriodKey(period, level);
    if (!parsed.valid) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    const publishedEntries = await getEntriesForPeriod(period, level, ["published", "draft"]);
    const entries = [...publishedEntries];

    if (includeDraftIds?.length) {
      const drafts = await listDrafts(parsed.periodKey);
      const selected = drafts.filter((d) => includeDraftIds.includes(d.id));

      for (const draft of selected) {
        if (draft.review_status === "rejected") continue;
        const normalized = (draft.normalized_data ?? draft.raw_data) as Record<string, unknown>;
        entries.push({
          id: draft.id,
          title: String(normalized.title ?? "Untitled"),
          description: normalized.description ? String(normalized.description) : null,
          url: null,
          source_name: normalized.source_name ? String(normalized.source_name) : null,
          source_url: normalized.source_url ? String(normalized.source_url) : null,
          image_url: normalized.image_url ? String(normalized.image_url) : null,
          image_alt: normalized.image_alt ? String(normalized.image_alt) : null,
          image_source_url: null,
          image_license: null,
          category: String(normalized.category ?? "meme"),
          tags: Array.isArray(normalized.tags) ? normalized.tags as string[] : [],
          period_start: String(normalized.period_start ?? parsed.periodStart),
          period_end: normalized.period_end ? String(normalized.period_end) : null,
          period_granularity: level,
          origin: "generated_draft",
          confidence: "medium",
          status: "draft",
          featured: false,
          editorial_note: null,
          opinion: null,
          quote: null,
          seo_title: null,
          seo_description: null,
          slug: null,
          created_at: draft.created_at,
          updated_at: draft.created_at,
        } as CapsuleEntry);
      }
    }

    const capsule = buildCapsule(period, level, entries, true);
    const response = NextResponse.json(capsule);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
