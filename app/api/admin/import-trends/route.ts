import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { importTrendDrafts } from "@/lib/trends/importTrends";
import type { PeriodLevel } from "@/lib/capsule/types";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(request: NextRequest) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const keywords = Array.isArray(body.keywords)
      ? body.keywords
      : String(body.keywords ?? "")
          .split(/\r?\n|,/)
          .map((keyword) => keyword.trim())
          .filter(Boolean);

    const result = await importTrendDrafts({
      period: String(body.period ?? ""),
      level: body.level as PeriodLevel,
      keywords,
      includeGdelt: Boolean(body.includeGdelt),
    });

    await logAdminAction("import_trend_drafts", "period", String(body.period ?? ""), result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
