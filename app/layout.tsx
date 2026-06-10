import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cache Me Outside",
  description: "A reviewed 2020 internet time capsule — newspaper-style archive of what the web was paying attention to.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
