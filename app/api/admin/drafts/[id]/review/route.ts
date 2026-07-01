import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { updateDraftReview, publishDraftAsEntry } from "@/lib/admin/review";
import type { DraftReviewStatus } from "@/lib/capsule/types";
import { revalidatePeriod } from "@/lib/cache/revalidate";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  const { id } = await params;
  try {
    const body = await request.json();

    if (body.action === "publish") {
      const entryId = await publishDraftAsEntry(id);
      if (body.period && body.level) {
        revalidatePeriod(body.period, body.level);
      }
      return NextResponse.json({ entryId });
    }

    const draft = await updateDraftReview(
      id,
      body.review_status as DraftReviewStatus,
      body.review_note
    );
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
