import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMobileUserAgent } from "@/lib/admin/device";

const SESSION_COOKIE = "cmo_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/access/");

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow verify page and access endpoints through (with their own guards)
  if (
    pathname === "/admin/verify" ||
    pathname.startsWith("/api/admin/access/")
  ) {
    if (isMobileUserAgent(request.headers.get("user-agent"))) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  if (isMobileUserAgent(request.headers.get("user-agent"))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
