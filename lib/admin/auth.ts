import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { authenticator } from "otplib";
import type { NextRequest } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import { isDesktopUserAgent } from "./device";

const SESSION_COOKIE = "cmo_admin_session";
const MAGIC_TTL_MS = (parseInt(process.env.MAGIC_LINK_TTL_MINUTES ?? "10", 10) || 10) * 60 * 1000;
const SESSION_TTL_MS = (parseInt(process.env.ADMIN_SESSION_TTL_MINUTES ?? "10", 10) || 10) * 60 * 1000;
const WRITE_IDLE_MS = (parseInt(process.env.ADMIN_WRITE_IDLE_MINUTES ?? "5", 10) || 5) * 60 * 1000;

type PendingToken = {
  tokenHash: string;
  expiresAt: number;
};

type AdminSession = {
  sessionId: string;
  fingerprint: string;
  expiresAt: number;
  lastReauthenticatedAt: number;
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
    if (isSupabaseConfigured()) {
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

export async function verifyMagicToken(token: string): Promise<boolean> {
  const tokenHash = hashValue(token);
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("admin_access_tokens")
        .select("expires_at, used_at")
        .eq("token_hash", tokenHash)
        .single();

      if (!error && data) {
        return !data.used_at && new Date(data.expires_at).getTime() > Date.now();
      }
    } catch {
      // Fall back to in-memory storage for local/dev resilience.
    }
  }

  const pending = pendingTokens.get(tokenHash);
  if (!pending) return false;
  if (Date.now() > pending.expiresAt) {
    pendingTokens.delete(tokenHash);
    return false;
  }
  return true;
}

export async function createAdminSession(fingerprint: string): Promise<string> {
  const sessionId = randomBytes(24).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  sessions.set(sessionId, {
    sessionId,
    fingerprint,
    expiresAt,
    lastReauthenticatedAt: now,
  });

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      await supabase.from("admin_sessions").insert({
        session_hash: hashValue(sessionId),
        fingerprint,
        expires_at: new Date(expiresAt).toISOString(),
        last_reauthenticated_at: new Date(now).toISOString(),
      });
    } catch {
      // In-memory session remains available for the current process.
    }
  }

  return sessionId;
}

export async function getSession(sessionId: string): Promise<AdminSession | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("fingerprint, expires_at, last_reauthenticated_at")
        .eq("session_hash", hashValue(sessionId))
        .single();

      if (!error && data) {
        const expiresAt = new Date(data.expires_at).getTime();
        if (Date.now() > expiresAt) return null;

        await supabase
          .from("admin_sessions")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("session_hash", hashValue(sessionId));

        return {
          sessionId,
          fingerprint: data.fingerprint,
          expiresAt,
          lastReauthenticatedAt: new Date(data.last_reauthenticated_at).getTime(),
        };
      }
    } catch {
      // Fall back to in-memory session for local/dev resilience.
    }
  }

  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export async function invalidateMagicToken(token: string): Promise<void> {
  const tokenHash = hashValue(token);
  pendingTokens.delete(tokenHash);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      await supabase
        .from("admin_access_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token_hash", tokenHash);
    } catch {
      // Token has still been invalidated for the current process.
    }
  }
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

export async function validateAdminRequest(
  request: NextRequest,
  sessionId?: string | null
): Promise<{ authorized: boolean; fresh: boolean }> {
  if (!isDesktopUserAgent(request.headers.get("user-agent"))) {
    return { authorized: false, fresh: false };
  }
  if (!sessionId) return { authorized: false, fresh: false };
  const session = await getSession(sessionId);
  if (!session) return { authorized: false, fresh: false };
  const fingerprint = buildFingerprint(request);
  const authorized = session.fingerprint === fingerprint;
  return {
    authorized,
    fresh: authorized && Date.now() - session.lastReauthenticatedAt <= WRITE_IDLE_MS,
  };
}

export async function requireAdminSession(
  request: NextRequest
): Promise<{ authorized: boolean; fresh: boolean; sessionId: string | null }> {
  if (!isDesktopUserAgent(request.headers.get("user-agent"))) {
    return { authorized: false, fresh: false, sessionId: null };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const result = await validateAdminRequest(request, sessionId);
  return { ...result, sessionId };
}

export function clearSessionsForTesting(): void {
  sessions.clear();
  pendingTokens.clear();
}

export const GENERIC_ACCESS_RESPONSE = {
  message: "If your request was valid, further instructions have been sent.",
};
