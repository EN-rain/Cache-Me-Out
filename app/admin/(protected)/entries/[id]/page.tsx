"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CapsuleEntry } from "@/lib/capsule/types";
import { EntryForm } from "@/components/admin/EntryForm";
import { ImageAuditCard } from "@/components/admin/ImageAuditCard";

export default function EditEntryPage() {
  const params = useParams();
  const id = params.id as string;
  const [entry, setEntry] = useState<CapsuleEntry | null>(null);

  useEffect(() => {
    fetch(`/api/admin/entries/${id}`)
      .then((r) => r.json())
      .then(setEntry);
  }, [id]);

  if (!entry) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Entry</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EntryForm entry={entry} onSaved={() => window.location.reload()} />
        </div>
        <div>
          <h2 className="font-bold mb-3">Image audit</h2>
          <ImageAuditCard
            imageUrl={entry.image_url ?? undefined}
            imageAlt={entry.image_alt ?? undefined}
            imageSourceUrl={entry.image_source_url ?? undefined}
            imageLicense={entry.image_license ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
