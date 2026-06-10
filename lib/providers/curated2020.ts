import curatedData from "@/data/curated-2020.json";

export type CuratedItem = {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  source_name?: string;
  source_url?: string;
  image_url?: string;
  image_alt?: string;
  image_source_url?: string;
  image_license?: string;
  confidence?: string;
};

const data = curatedData as Record<string, CuratedItem[]>;

export function getCuratedItemsForPeriod(periodKey: string): CuratedItem[] {
  if (data[periodKey]) return data[periodKey];

  if (periodKey === "2020") {
    return Object.entries(data)
      .filter(([key]) => key.startsWith("2020-") && key.split("-").length === 2)
      .flatMap(([, items]) => items);
  }

  return [];
}

export function getAllCuratedPeriodKeys(): string[] {
  return Object.keys(data);
}
