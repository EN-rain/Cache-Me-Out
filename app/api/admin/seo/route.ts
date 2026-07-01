import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { getPeriodSeo, upsertPeriodSeo } from "@/lib/admin/seo";
import { revalidatePeriod } from "@/lib/cache/revalidate";

export async function GET(request: NextRequest) {
  const blocked = await adminGuard(request);
  if (blocked) return blocked;

  const period = request.nextUrl.searchParams.get("period");
  if (!period) {
    return NextResponse.json({ error: "period required" }, { status: 400 });
  }

  const seo = await getPeriodSeo(period);
  return NextResponse.json(seo);
}

export async function POST(request: NextRequest) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const seo = await upsertPeriodSeo(body);
    revalidatePeriod(seo.period_key, seo.level);
    return NextResponse.json(seo);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
