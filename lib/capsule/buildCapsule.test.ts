import { describe, it, expect } from "vitest";
import { buildCapsule } from "./buildCapsule";
import type { CapsuleEntry } from "./types";

const sampleEntry = (overrides: Partial<CapsuleEntry> = {}): CapsuleEntry => ({
  id: "1",
  title: "Tiger King goes global",
  description: "Memes everywhere",
  url: null,
  source_name: "Netflix",
  source_url: null,
  image_url: null,
  image_alt: null,
  image_source_url: null,
  image_license: null,
  category: "viral_moment",
  tags: ["tiger-king"],
  period_start: "2020-03-01",
  period_end: "2020-03-31",
  period_granularity: "month",
  origin: "curated_seed",
  confidence: "high",
  status: "published",
  featured: true,
  editorial_note: null,
  opinion: null,
  quote: null,
  seo_title: null,
  seo_description: null,
  slug: "tiger-king",
  created_at: "2020-01-01",
  updated_at: "2020-01-01",
  ...overrides,
});

describe("buildCapsule", () => {
  it("builds capsule from published entries", () => {
    const capsule = buildCapsule("2020-03", "month", [sampleEntry()]);
    expect(capsule).not.toBeNull();
    expect(capsule?.headline).toContain("Tiger King");
    expect(capsule?.sources.curated).toBe(true);
  });

  it("excludes draft entries from public build", () => {
    const capsule = buildCapsule("2020-03", "month", [
      sampleEntry({ status: "draft", title: "Secret draft" }),
    ]);
    expect(capsule?.sections.culture.length).toBe(0);
  });

  it("includes drafts in preview mode", () => {
    const capsule = buildCapsule("2020-03", "month", [
      sampleEntry({ status: "draft", title: "Preview draft" }),
    ], true);
    expect(capsule?.sections.culture.length).toBeGreaterThan(0);
  });

  it("returns null for invalid period", () => {
    expect(buildCapsule("2019-03", "month", [])).toBeNull();
  });
});
