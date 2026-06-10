import type { MetadataRoute } from "next";
import { monthNumberToSlug } from "@/lib/capsule/period";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/2020`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  for (let m = 1; m <= 12; m++) {
    const slug = monthNumberToSlug(m);
    entries.push({
      url: `${siteUrl}/2020/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
