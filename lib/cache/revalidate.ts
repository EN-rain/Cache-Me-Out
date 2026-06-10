import { revalidatePath } from "next/cache";
import type { PeriodLevel } from "@/lib/capsule/types";
import { monthNumberToSlug } from "@/lib/capsule/period";

export function revalidatePeriod(period: string, level: PeriodLevel): void {
  revalidatePath("/2020");

  if (level === "year") return;

  const parts = period.split("-");
  if (parts.length >= 2) {
    const month = parseInt(parts[1], 10);
    const monthSlug = monthNumberToSlug(month);
    revalidatePath(`/2020/${monthSlug}`);

    if (level === "day" && parts.length >= 3) {
      revalidatePath(`/2020/${monthSlug}/${parseInt(parts[2], 10)}`);
    }
  }

  revalidatePath("/sitemap.xml");
}
