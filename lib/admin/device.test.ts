import { describe, it, expect } from "vitest";
import { isMobileUserAgent, isDesktopUserAgent } from "./device";

describe("device detection", () => {
  it("detects iPhone as mobile", () => {
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
    expect(isMobileUserAgent(ua)).toBe(true);
    expect(isDesktopUserAgent(ua)).toBe(false);
  });

  it("detects iPad as mobile (fail closed)", () => {
    const ua = "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)";
    expect(isMobileUserAgent(ua)).toBe(true);
  });

  it("detects Android phone as mobile", () => {
    const ua = "Mozilla/5.0 (Linux; Android 10; Mobile) Chrome/91.0";
    expect(isMobileUserAgent(ua)).toBe(true);
  });

  it("allows desktop Chrome", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0";
    expect(isMobileUserAgent(ua)).toBe(false);
    expect(isDesktopUserAgent(ua)).toBe(true);
  });

  it("fails closed on missing UA", () => {
    expect(isMobileUserAgent(null)).toBe(true);
  });
});
