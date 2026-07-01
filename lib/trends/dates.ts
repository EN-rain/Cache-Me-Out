import type { PeriodLevel } from "@/lib/capsule/types";
import { parsePeriodKey } from "@/lib/capsule/period";

export function compactDate(date: string): string {
  return date.replace(/-/g, "");
}

export function trendDateRange(period: string, level: PeriodLevel): {
  valid: boolean;
  periodKey: string;
  start: string;
  end: string;
} {
  const parsed = parsePeriodKey(period, level);
  if (!parsed.valid) {
    return { valid: false, periodKey: "", start: "", end: "" };
  }

  return {
    valid: true,
    periodKey: parsed.periodKey,
    start: parsed.periodStart,
    end: parsed.periodEnd,
  };
}
