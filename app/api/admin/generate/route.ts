import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { createDraftsForPeriod } from "@/lib/generator/createDrafts";
import type { PeriodLevel } from "@/lib/capsule/types";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(request: NextRequest) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { period, level, notes } = body as {
      period: string;
      level: PeriodLevel;
      notes?: string;
    };

    if (!period || !level) {
      return NextResponse.json({ error: "period and level required" }, { status: 400 });
    }

    const result = await createDraftsForPeriod(period, level, notes);
    await logAdminAction("generate_drafts", "period", period, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
