import { createHash } from "crypto";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionFromCookies } from "./auth";
import { isDesktopUserAgent } from "./device";

function getIpPrefix(ipAddr: string): string {
  if (ipAddr.includes(":")) {
    return ipAddr.split(":").slice(0, 4).join(":");
  }
  return ipAddr.split(".").slice(0, 3).join(".");
}

function buildFingerprintFromHeaders(headersList: Headers): string {
  const ua = headersList.get("user-agent") ?? "";
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  return createHash("sha256").update(`${getIpPrefix(ip)}:${ua}`).digest("hex");
}

export async function requireAdminPage(): Promise<void> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  if (!isDesktopUserAgent(userAgent)) {
    notFound();
  }

  const session = await getSessionFromCookies();
  if (!session) {
    notFound();
  }

  const fingerprint = buildFingerprintFromHeaders(headersList);
  if (session.fingerprint !== fingerprint) {
    notFound();
  }
}
