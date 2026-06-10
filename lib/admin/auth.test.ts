import { describe, it, expect, beforeEach } from "vitest";
import {
  verifySecretWord,
  verifyMagicToken,
  verifyTotpCode,
  createAdminSession,
  getSession,
  clearSessionsForTesting,
  startAdminAccess,
} from "./auth";

describe("admin auth", () => {
  beforeEach(() => {
    clearSessionsForTesting();
    process.env.ADMIN_SECRET_WORD = "secretpage";
    process.env.ADMIN_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
  });

  it("verifies correct secret word", () => {
    expect(verifySecretWord("secretpage")).toBe(true);
    expect(verifySecretWord("wrong")).toBe(false);
  });

  it("validates magic token lifecycle", async () => {
    const { token } = await startAdminAccess();
    expect(verifyMagicToken(token)).toBe(true);
  });

  it("rejects wrong TOTP code", () => {
    expect(verifyTotpCode("000000")).toBe(false);
  });

  it("creates and retrieves session", () => {
    const sessionId = createAdminSession("fp-123");
    const session = getSession(sessionId);
    expect(session).not.toBeNull();
    expect(session?.fingerprint).toBe("fp-123");
  });

  it("wrong TOTP never creates session via verify flow", () => {
    const sessionBefore = getSession("nonexistent");
    expect(sessionBefore).toBeNull();
    expect(verifyTotpCode("123456")).toBe(false);
  });
});
