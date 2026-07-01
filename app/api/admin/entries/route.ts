import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { listEntries, createEntry } from "@/lib/admin/entries";
import { revalidatePeriod } from "@/lib/cache/revalidate";

export async function GET(request: NextRequest) {
  const blocked = await adminGuard(request);
  if (blocked) return blocked;

  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const source = request.nextUrl.searchParams.get("source") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const period = request.nextUrl.searchParams.get("period") ?? undefined;

  try {
    const entries = await listEntries({ status: status as never, category, source, search, period });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const entry = await createEntry(body);
    if (entry.status === "published") {
      revalidatePeriod(entry.period_start, entry.period_granularity);
    }
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
