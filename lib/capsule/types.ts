export type PeriodLevel = "year" | "month" | "day";
export type EntryStatus = "draft" | "published" | "archived";
export type EntryOrigin = "manual" | "generated_draft" | "curated_seed";
export type Confidence = "high" | "medium" | "low";
export type DraftReviewStatus = "pending" | "approved" | "rejected" | "needs_edit";

export type CapsuleItem = {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  origin?: EntryOrigin;
  category?: string;
  source: string;
};

export type CapsuleResponse = {
  period: string;
  level: PeriodLevel;
  headline: string;
  summary: string;
  confidence: Confidence;
  sections: {
    culture: CapsuleItem[];
    events: CapsuleItem[];
    discussion: CapsuleItem[];
    opinions: CapsuleItem[];
  };
  sources: {
    managed: boolean;
    curated: boolean;
    generated: boolean;
  };
};

export type CapsuleEntry = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_source_url: string | null;
  image_license: string | null;
  category: string;
  tags: string[];
  period_start: string;
  period_end: string | null;
  period_granularity: PeriodLevel;
  origin: EntryOrigin;
  confidence: Confidence;
  status: EntryStatus;
  featured: boolean;
  editorial_note: string | null;
  opinion: string | null;
  quote: string | null;
  seo_title: string | null;
  seo_description: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
};

export type CapsuleDraft = {
  id: string;
  period_key: string;
  level: PeriodLevel;
  generator_name: string;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown> | null;
  review_status: DraftReviewStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type PeriodSeo = {
  id: string;
  period_key: string;
  level: PeriodLevel;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  updated_at: string;
};
