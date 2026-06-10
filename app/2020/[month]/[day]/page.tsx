import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewspaperPage } from "@/components/NewspaperPage";
import { HiddenAdminTrigger } from "@/components/HiddenAdminTrigger";
import { periodFromRoute } from "@/lib/capsule/period";
import { loadPublicCapsule } from "@/lib/capsule/loadCapsule";
import { getPeriodMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ month: string; day: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month, day } = await params;
  const route = periodFromRoute(month, day);
  if (!route.valid) return {};
  const meta = await getPeriodMetadata(route.period, "day");
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

export default async function DayPage({ params }: Props) {
  const { month, day } = await params;
  const route = periodFromRoute(month, day);
  if (!route.valid) notFound();

  const capsule = await loadPublicCapsule(route.period, "day");
  if (!capsule) notFound();

  return (
    <>
      <NewspaperPage capsule={capsule} />
      <HiddenAdminTrigger />
    </>
  );
}
