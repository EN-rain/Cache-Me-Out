import { NextRequest, NextResponse } from "next/server";
import {
  verifyMagicToken,
  verifyTotpCode,
  createAdminSession,
  setSessionCookie,
  invalidateMagicToken,
  buildFingerprint,
} from "@/lib/admin/auth";
import { isMobileUserAgent } from "@/lib/admin/device";

export async function POST(request: NextRequest) {
  if (isMobileUserAgent(request.headers.get("user-agent"))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let body: { token?: string; code?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, code } = body;
  if (!token || !code) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  if (!verifyMagicToken(token)) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  if (!verifyTotpCode(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  invalidateMagicToken(token);
  const fingerprint = buildFingerprint(request);
  const sessionId = createAdminSession(fingerprint);
  await setSessionCookie(sessionId);

  return NextResponse.json({ success: true });
}
