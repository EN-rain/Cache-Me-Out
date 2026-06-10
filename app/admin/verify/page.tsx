import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isDesktopUserAgent } from "@/lib/admin/device";
import { VerifyForm } from "@/components/admin/VerifyForm";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyPage({ searchParams }: Props) {
  const headersList = await headers();
  if (!isDesktopUserAgent(headersList.get("user-agent"))) {
    notFound();
  }

  const { token } = await searchParams;
  if (!token) notFound();

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Admin Verification</h1>
      <VerifyForm token={token} />
    </div>
  );
}
