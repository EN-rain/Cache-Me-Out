import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { authenticator } from "otplib";
import type { NextRequest } from "next/server";
import { getSupabase } from "@/lib/db/supabase";
import { isDesktopUserAgent } from "./device";

const SESSION_COOKIE = "cmo_admin_session";
const MAGIC_TTL_MS = (parseInt(process.env.MAGIC_LINK_TTL_MINUTES ?? "10", 10) || 10) * 60 * 1000;
const SESSION_TTL_MS = (parseInt(process.env.ADMIN_SESSION_TTL_MINUTES ?? "10", 10) || 10) * 60 * 1000;

type PendingToken = {
  tokenHash: string;
  expiresAt: number;
};

type AdminSession = {
  sessionId: string;
  fingerprint: string;
  expiresAt: number;
};

const pendingTokens = new Map<string, PendingToken>();
const sessions = new Map<string, AdminSession>();

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getIpPrefix(ip: string | null): string {
  if (!ip) return "unknown";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":");
  }
  const parts = ip.split(".");
  return parts.slice(0, 3).join(".");
}

export function buildFingerprint(request: NextRequest | Request): string {
  const ua = request.headers.get("user-agent") ?? "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return hashValue(`${getIpPrefix(ip)}:${ua}`);
}

export function verifySecretWord(word: string): boolean {
  const secret = process.env.ADMIN_SECRET_WORD ?? "secretpage";
  return word === secret;
}

export async function startAdminAccess(): Promise<{
  token: string;
  verifyUrl: string;
}> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashValue(token);
  const expiresAt = Date.now() + MAGIC_TTL_MS;

  pendingTokens.set(tokenHash, { tokenHash, expiresAt });

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getSupabase();
      await supabase.from("admin_access_tokens").insert({
        token_hash: tokenHash,
        expires_at: new Date(expiresAt).toISOString(),
      });
    }
  } catch {
    // In-memory fallback still works
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verifyUrl = `${siteUrl}/admin/verify?token=${token}`;

  return { token, verifyUrl };
}

export function verifyTotpCode(code: string): boolean {
  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!secret) return false;
  return authenticator.verify({ token: code, secret });
}

export function verifyMagicToken(token: string): boolean {
  const tokenHash = hashValue(token);
  const pending = pendingTokens.get(tokenHash);
  if (!pending) return false;
  if (Date.now() > pending.expiresAt) {
    pendingTokens.delete(tokenHash);
    return false;
  }
  return true;
}

export function createAdminSession(fingerprint: string): string {
  const sessionId = randomBytes(24).toString("hex");
  sessions.set(sessionId, {
    sessionId,
    fingerprint,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getSession(sessionId: string): AdminSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function invalidateMagicToken(token: string): void {
  pendingTokens.delete(hashValue(token));
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export function validateAdminRequest(
  request: NextRequest,
  sessionId?: string | null
): boolean {
  if (!isDesktopUserAgent(request.headers.get("user-agent"))) return false;
  if (!sessionId) return false;
  const session = getSession(sessionId);
  if (!session) return false;
  const fingerprint = buildFingerprint(request);
  return session.fingerprint === fingerprint;
}

export async function requireAdminSession(
  request: NextRequest
): Promise<{ authorized: boolean; sessionId: string | null }> {
  if (!isDesktopUserAgent(request.headers.get("user-agent"))) {
    return { authorized: false, sessionId: null };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const authorized = validateAdminRequest(request, sessionId);
  return { authorized, sessionId };
}

export function clearSessionsForTesting(): void {
  sessions.clear();
  pendingTokens.clear();
}

export const GENERIC_ACCESS_RESPONSE = {
  message: "If your request was valid, further instructions have been sent.",
};
