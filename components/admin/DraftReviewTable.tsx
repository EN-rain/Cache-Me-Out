"use client";

import type { CapsuleDraft } from "@/lib/capsule/types";

type DraftReviewTableProps = {
  drafts: CapsuleDraft[];
  onReview: (id: string, status: string, note?: string) => void;
  onPublish?: (id: string) => void;
};

export function DraftReviewTable({ drafts, onReview, onPublish }: DraftReviewTableProps) {
  if (drafts.length === 0) {
    return <p className="text-[var(--color-muted)] font-sans">No drafts for this period.</p>;
  }

  return (
    <div className="space-y-4 font-sans">
      {drafts.map((draft) => {
        const data = (draft.normalized_data ?? draft.raw_data) as Record<string, unknown>;
        return (
          <div key={draft.id} className="border border-[var(--color-rule)] p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold">{String(data.title ?? "Untitled")}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  {String(data.description ?? "")}
                </p>
                <p className="text-xs mt-2 text-[var(--color-muted)]">
                  {draft.period_key} · {draft.generator_name} · {draft.review_status}
                </p>
              </div>
              {typeof data.image_url === "string" && data.image_url && (
                <img
                  src={data.image_url}
                  alt={String(data.image_alt ?? "")}
                  className="w-24 h-24 object-cover border"
                />
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onReview(draft.id, "approved")}
                className="text-xs border px-3 py-1 hover:bg-green-50"
              >
                Approve
              </button>
              <button
                onClick={() => onReview(draft.id, "needs_edit")}
                className="text-xs border px-3 py-1 hover:bg-amber-50"
              >
                Needs edit
              </button>
              <button
                onClick={() => onReview(draft.id, "rejected")}
                className="text-xs border px-3 py-1 hover:bg-red-50"
              >
                Reject
              </button>
              {draft.review_status === "approved" && onPublish && (
                <button
                  onClick={() => onPublish(draft.id)}
                  className="text-xs bg-[var(--color-ink)] text-white px-3 py-1"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
