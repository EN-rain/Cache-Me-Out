import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewspaperPage } from "@/components/NewspaperPage";
import { HiddenAdminTrigger } from "@/components/HiddenAdminTrigger";
import { periodFromRoute } from "@/lib/capsule/period";
import { loadPublicCapsule } from "@/lib/capsule/loadCapsule";
import { getPeriodMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ month: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const route = periodFromRoute(month);
  if (!route.valid) return {};
  const meta = await getPeriodMetadata(route.period, "month");
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

export default async function MonthPage({ params }: Props) {
  const { month } = await params;
  const route = periodFromRoute(month);
  if (!route.valid) notFound();

  const capsule = await loadPublicCapsule(route.period, "month");
  if (!capsule) notFound();

  return (
    <>
      <NewspaperPage capsule={capsule} />
      <HiddenAdminTrigger />
    </>
  );
}
