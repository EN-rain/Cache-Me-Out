import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewspaperPage } from "@/components/NewspaperPage";
import { HiddenAdminTrigger } from "@/components/HiddenAdminTrigger";
import { loadPublicCapsule } from "@/lib/capsule/loadCapsule";
import { getPeriodMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPeriodMetadata("2020", "year");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
  };
}

export default async function Year2020Page() {
  const capsule = await loadPublicCapsule("2020", "year");
  if (!capsule) notFound();

  return (
    <>
      <NewspaperPage capsule={capsule} />
      <HiddenAdminTrigger />
    </>
  );
}
