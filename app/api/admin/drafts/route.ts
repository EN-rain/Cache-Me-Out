import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { listDrafts } from "@/lib/admin/review";

export async function GET(request: NextRequest) {
  const blocked = await adminGuard(request);
  if (blocked) return blocked;

  const period = request.nextUrl.searchParams.get("period") ?? undefined;
  try {
    const drafts = await listDrafts(period);
    return NextResponse.json(drafts);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
