import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminSession } from "./auth";

export async function adminGuard(
  request: NextRequest
): Promise<NextResponse | null> {
  const { authorized } = await requireAdminSession(request);
  if (!authorized) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return null;
}

export function notFoundResponse(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}
