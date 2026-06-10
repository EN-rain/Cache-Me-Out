import type { CapsuleResponse } from "@/lib/capsule/types";
import { formatPeriodLabel } from "@/lib/capsule/period";
import { SourceBadge } from "./SourceBadge";
import { Breadcrumbs } from "./Breadcrumbs";
import { PeriodPicker } from "./PeriodPicker";
import { buildPublicPath } from "@/lib/capsule/paths";

type NewspaperPageProps = {
  capsule: CapsuleResponse;
  isPreview?: boolean;
};

function Column({
  title,
  items,
}: {
  title: string;
  items: CapsuleResponse["sections"]["culture"];
}) {
  return (
    <div className="newspaper-column px-4 py-2">
      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-[var(--color-rule)] pb-2 mb-4">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] italic">No entries for this section.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`}>
              <h3 className="font-bold text-base leading-tight">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)]">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              {item.description && (
                <p className="text-sm mt-1 text-[var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              )}
              <p className="text-xs mt-1 text-[var(--color-muted)]">— {item.source}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NewspaperPage({ capsule, isPreview = false }: NewspaperPageProps) {
  const label = formatPeriodLabel(capsule.period, capsule.level);
  const path = buildPublicPath(capsule.period, capsule.level);
  const monthNum = capsule.level !== "year" ? parseInt(capsule.period.split("-")[1], 10) : undefined;

  const crumbs = [
    { label: "2020", href: "/2020" },
    ...(capsule.level === "month" || capsule.level === "day"
      ? [{ label: formatPeriodLabel(capsule.period.split("-").slice(0, 2).join("-"), "month"), href: buildPublicPath(capsule.period.split("-").slice(0, 2).join("-"), "month") }]
      : []),
    ...(capsule.level === "day" ? [{ label: label }] : capsule.level === "month" ? [{ label: label }] : [{ label: "Overview" }]),
  ];

  const isEmpty =
    capsule.sections.culture.length === 0 &&
    capsule.sections.events.length === 0 &&
    capsule.sections.discussion.length === 0 &&
    capsule.sections.opinions.length === 0;

  return (
    <article className="max-w-5xl mx-auto px-4 py-8 relative">
      {isPreview && <div className="preview-watermark">DRAFT PREVIEW</div>}

      <header className="text-center border-b-4 border-double border-[var(--color-ink)] pb-4 mb-6">
        <p className="newspaper-masthead text-2xl md:text-3xl font-bold">Cache Me Outside</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">{label}</p>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Confidence: {capsule.confidence} · Reviewed archive
        </p>
      </header>

      <Breadcrumbs crumbs={crumbs} />
      <PeriodPicker currentMonth={monthNum} />

      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-center mb-4">
          {capsule.headline}
        </h1>
        <p className="text-lg text-center text-[var(--color-muted)] max-w-3xl mx-auto leading-relaxed">
          {capsule.summary}
        </p>
      </section>

      {isEmpty ? (
        <div className="text-center py-12 border border-dashed border-[var(--color-rule)]">
          <p className="text-lg italic text-[var(--color-muted)]">
            This period is still being archived.
          </p>
          <p className="text-sm mt-2 text-[var(--color-muted)]">
            Check back soon — or browse a nearby month for more coverage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[var(--color-rule)]">
          <Column title="Memes & Culture" items={capsule.sections.culture} />
          <Column title="Headlines & Events" items={capsule.sections.events} />
          <Column title="Reactions & Opinions" items={[...capsule.sections.discussion, ...capsule.sections.opinions]} />
        </div>
      )}

      <footer className="mt-8 pt-4 border-t border-[var(--color-rule)] flex flex-col md:flex-row justify-between items-start gap-4">
        <SourceBadge
          managed={capsule.sources.managed}
          curated={capsule.sources.curated}
          generated={capsule.sources.generated}
        />
        <p className="text-xs text-[var(--color-muted)]">
          Share: {path}
        </p>
      </footer>
    </article>
  );
}
