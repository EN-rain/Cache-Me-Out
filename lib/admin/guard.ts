import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminSession } from "./auth";

export async function adminGuard(
  request: NextRequest,
  options: { requireFresh?: boolean } = {}
): Promise<NextResponse | null> {
  const { authorized, fresh } = await requireAdminSession(request);
  if (!authorized) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (options.requireFresh && !fresh) {
    return NextResponse.json({ error: "Re-authentication required" }, { status: 401 });
  }
  return null;
}

export function notFoundResponse(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}
