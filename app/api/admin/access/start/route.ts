import { NextRequest, NextResponse } from "next/server";
import {
  verifySecretWord,
  startAdminAccess,
  GENERIC_ACCESS_RESPONSE,
  buildFingerprint,
} from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/admin/rateLimit";
import { sendMagicLinkEmail } from "@/lib/admin/email";
import { isMobileUserAgent } from "@/lib/admin/device";

export async function POST(request: NextRequest) {
  if (isMobileUserAgent(request.headers.get("user-agent"))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fingerprint = buildFingerprint(request);
  const { allowed } = checkRateLimit(`access:${fingerprint}`, 3, 60 * 60 * 1000);

  let body: { word?: string } = {};
  try {
    body = await request.json();
  } catch {
    // vague response
  }

  if (allowed && body.word && verifySecretWord(body.word)) {
    const { verifyUrl } = await startAdminAccess();
    await sendMagicLinkEmail(verifyUrl);
  }

  return NextResponse.json(GENERIC_ACCESS_RESPONSE);
}
