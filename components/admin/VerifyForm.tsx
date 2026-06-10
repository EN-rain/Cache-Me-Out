"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyForm({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code }),
    });

    if (!res.ok) {
      setError("Verification failed. Check your code and try again.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 font-sans">
      <p className="text-sm text-[var(--color-muted)]">
        Enter the code from your authenticator app.
      </p>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="000000"
        className="w-full border px-3 py-2 text-center text-2xl tracking-widest"
        required
      />
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--color-ink)] text-white py-2 disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify"}
      </button>
    </form>
  );
}
