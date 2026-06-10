import { monthNumberToSlug } from "./period";
import type { PeriodLevel } from "./types";

export function buildPublicPath(period: string, level: PeriodLevel): string {
  if (level === "year") return "/2020";

  const parts = period.split("-");
  const month = parseInt(parts[1], 10);
  const monthSlug = monthNumberToSlug(month);

  if (level === "month") return `/2020/${monthSlug}`;

  const day = parseInt(parts[2], 10);
  return `/2020/${monthSlug}/${day}`;
}
