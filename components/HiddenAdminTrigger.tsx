"use client";

import { useState } from "react";

export function HiddenAdminTrigger() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/access/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      setMessage(data.message);
      setWord("");
    } catch {
      setMessage("If your request was valid, further instructions have been sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:bottom-4 focus-within:right-4 focus-within:z-50 focus-within:bg-white focus-within:p-4 focus-within:border focus-within:shadow-lg"
      aria-label="Hidden access form"
    >
      <label htmlFor="secret-word" className="sr-only">
        Secret word
      </label>
      <input
        id="secret-word"
        type="password"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="·"
        className="border px-2 py-1 text-sm"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={loading}
        className="ml-2 text-sm underline disabled:opacity-50"
      >
        →
      </button>
      {message && (
        <p className="text-xs mt-2 text-[var(--color-muted)] max-w-xs">{message}</p>
      )}
    </form>
  );
}
