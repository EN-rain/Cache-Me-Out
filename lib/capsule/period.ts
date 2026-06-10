import type { PeriodLevel } from "./types";

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4,
  may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

const MONTH_SLUGS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export const SUPPORTED_YEAR = 2020;

export function monthSlugToNumber(slug: string): number | null {
  return MONTH_NAMES[slug.toLowerCase()] ?? null;
}

export function monthNumberToSlug(month: number): string {
  return MONTH_SLUGS[month - 1];
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isValidDay(year: number, month: number, day: number): boolean {
  if (year !== SUPPORTED_YEAR) return false;
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

export function parsePeriodKey(period: string, level: PeriodLevel): {
  valid: boolean;
  periodStart: string;
  periodEnd: string;
  periodKey: string;
} {
  if (level === "year") {
    if (period !== "2020") {
      return { valid: false, periodStart: "", periodEnd: "", periodKey: "" };
    }
    return {
      valid: true,
      periodStart: "2020-01-01",
      periodEnd: "2020-12-31",
      periodKey: "2020",
    };
  }

  if (level === "month") {
    const match = period.match(/^2020-(\d{2})$/);
    if (!match) return { valid: false, periodStart: "", periodEnd: "", periodKey: "" };
    const month = parseInt(match[1], 10);
    if (month < 1 || month > 12) return { valid: false, periodStart: "", periodEnd: "", periodKey: "" };
    const lastDay = daysInMonth(2020, month);
    const monthStr = String(month).padStart(2, "0");
    return {
      valid: true,
      periodStart: `2020-${monthStr}-01`,
      periodEnd: `2020-${monthStr}-${String(lastDay).padStart(2, "0")}`,
      periodKey: `2020-${monthStr}`,
    };
  }

  const match = period.match(/^2020-(\d{2})-(\d{2})$/);
  if (!match) return { valid: false, periodStart: "", periodEnd: "", periodKey: "" };
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  if (!isValidDay(2020, month, day)) {
    return { valid: false, periodStart: "", periodEnd: "", periodKey: "" };
  }
  const dateStr = `2020-${match[1]}-${match[2]}`;
  return {
    valid: true,
    periodStart: dateStr,
    periodEnd: dateStr,
    periodKey: dateStr,
  };
}

export function periodFromRoute(monthSlug?: string, dayStr?: string): {
  level: PeriodLevel;
  period: string;
  valid: boolean;
  displayLabel: string;
} {
  if (!monthSlug) {
    return { level: "year", period: "2020", valid: true, displayLabel: "2020" };
  }

  const monthNum = monthSlugToNumber(monthSlug);
  if (!monthNum) {
    return { level: "year", period: "2020", valid: false, displayLabel: "" };
  }

  const monthPadded = String(monthNum).padStart(2, "0");
  const monthLabel = monthSlug.charAt(0).toUpperCase() + monthSlug.slice(1);

  if (!dayStr) {
    return {
      level: "month",
      period: `2020-${monthPadded}`,
      valid: true,
      displayLabel: `${monthLabel} 2020`,
    };
  }

  const day = parseInt(dayStr, 10);
  if (!isValidDay(2020, monthNum, day)) {
    return { level: "day", period: "", valid: false, displayLabel: "" };
  }

  return {
    level: "day",
    period: `2020-${monthPadded}-${String(day).padStart(2, "0")}`,
    valid: true,
    displayLabel: `${monthLabel} ${day}, 2020`,
  };
}

export function formatPeriodLabel(period: string, level: PeriodLevel): string {
  if (level === "year") return "2020";
  if (level === "month") {
    const month = parseInt(period.split("-")[1], 10);
    return `${monthNumberToSlug(month).charAt(0).toUpperCase()}${monthNumberToSlug(month).slice(1)} 2020`;
  }
  const [, mm, dd] = period.split("-");
  const month = parseInt(mm, 10);
  return `${monthNumberToSlug(month).charAt(0).toUpperCase()}${monthNumberToSlug(month).slice(1)} ${parseInt(dd, 10)}, 2020`;
}

export function validateEntryPeriod(
  periodStart: string,
  periodEnd: string | null,
  granularity: PeriodLevel
): string | null {
  const startYear = parseInt(periodStart.split("-")[0], 10);
  if (startYear !== SUPPORTED_YEAR) return "Only 2020 periods are supported";

  if (periodEnd && periodEnd < periodStart) {
    return "period_end must not be before period_start";
  }

  if (granularity === "day") {
    if (!periodEnd || periodEnd !== periodStart) {
      return "Day entries must use a single exact date";
    }
  }

  if (granularity === "month") {
    const [, mm] = periodStart.split("-");
    const month = parseInt(mm, 10);
    const expectedEnd = `2020-${mm}-${String(daysInMonth(2020, month)).padStart(2, "0")}`;
    if (periodEnd !== expectedEnd || !periodStart.endsWith("-01")) {
      return "Month entries must span the full month";
    }
  }

  if (granularity === "year") {
    if (periodStart !== "2020-01-01" || periodEnd !== "2020-12-31") {
      return "Year entries must span 2020-01-01 through 2020-12-31";
    }
  }

  return null;
}
