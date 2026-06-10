import Link from "next/link";
import { monthNumberToSlug } from "@/lib/capsule/period";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PeriodPicker({ currentMonth }: { currentMonth?: number }) {
  return (
    <div className="border-t border-b border-[var(--color-rule)] py-4 my-6">
      <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Browse 2020
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/2020"
          className="text-sm hover:text-[var(--color-accent)] underline"
        >
          Year
        </Link>
        {MONTHS.map((name, i) => {
          const slug = monthNumberToSlug(i + 1);
          const isCurrent = currentMonth === i + 1;
          return (
            <Link
              key={slug}
              href={`/2020/${slug}`}
              className={`text-sm hover:text-[var(--color-accent)] ${isCurrent ? "font-bold text-[var(--color-accent)]" : "underline"}`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
