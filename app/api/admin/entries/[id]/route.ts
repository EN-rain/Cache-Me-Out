import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin/guard";
import { getEntry, updateEntry, publishEntry, archiveEntry } from "@/lib/admin/entries";
import { revalidatePeriod } from "@/lib/cache/revalidate";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const blocked = await adminGuard(request);
  if (blocked) return blocked;

  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const blocked = await adminGuard(request, { requireFresh: true });
  if (blocked) return blocked;

  const { id } = await params;
  try {
    const body = await request.json();

    let entry;
    if (body.action === "publish") {
      entry = await publishEntry(id);
    } else if (body.action === "archive") {
      entry = await archiveEntry(id);
    } else {
      entry = await updateEntry(id, body);
    }

    revalidatePeriod(entry.period_start, entry.period_granularity);
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
