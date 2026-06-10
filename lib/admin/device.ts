export function isMobileUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  const mobilePatterns = [
    /android.*mobile/,
    /iphone/,
    /ipod/,
    /windows phone/,
    /blackberry/,
    /opera mini/,
    /mobile safari/,
  ];

  if (mobilePatterns.some((p) => p.test(ua))) return true;

  // Tablets treated as mobile for admin (fail closed)
  if (/ipad|android(?!.*mobile)|tablet|kindle|silk/.test(ua)) return true;

  return false;
}

export function isDesktopUserAgent(userAgent: string | null): boolean {
  return !isMobileUserAgent(userAgent);
}
