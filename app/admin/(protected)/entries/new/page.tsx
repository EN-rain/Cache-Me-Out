"use client";

import { EntryForm } from "@/components/admin/EntryForm";
import { useRouter } from "next/navigation";

export default function NewEntryPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Entry</h1>
      <EntryForm onSaved={() => router.push("/admin/entries")} />
    </div>
  );
}
