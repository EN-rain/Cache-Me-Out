type ImageAuditCardProps = {
  imageUrl?: string;
  imageAlt?: string;
  imageSourceUrl?: string;
  imageLicense?: string;
};

export function ImageAuditCard({
  imageUrl,
  imageAlt,
  imageSourceUrl,
  imageLicense,
}: ImageAuditCardProps) {
  if (!imageUrl) {
    return (
      <div className="border border-dashed border-[var(--color-rule)] p-4 text-sm text-[var(--color-muted)] font-sans">
        No image attached
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-rule)] p-4 font-sans">
      <img src={imageUrl} alt={imageAlt ?? ""} className="max-w-full h-48 object-cover mb-3" />
      <dl className="text-sm space-y-1">
        <div><dt className="inline font-medium">Alt: </dt><dd className="inline">{imageAlt ?? "—"}</dd></div>
        <div><dt className="inline font-medium">Source: </dt><dd className="inline">{imageSourceUrl ?? "—"}</dd></div>
        <div><dt className="inline font-medium">License: </dt><dd className="inline">{imageLicense ?? "—"}</dd></div>
      </dl>
    </div>
  );
}
