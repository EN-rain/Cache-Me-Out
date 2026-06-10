import { NextRequest, NextResponse } from "next/server";
import { parsePeriodKey } from "@/lib/capsule/period";
import type { PeriodLevel } from "@/lib/capsule/types";
import { loadPublicCapsule } from "@/lib/capsule/loadCapsule";

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period");
  const level = request.nextUrl.searchParams.get("level") as PeriodLevel | null;

  if (!period || !level || !["year", "month", "day"].includes(level)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) {
    return NextResponse.json({ error: "Invalid 2020 period" }, { status: 404 });
  }

  const capsule = await loadPublicCapsule(period, level);
  if (!capsule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(capsule);
}
