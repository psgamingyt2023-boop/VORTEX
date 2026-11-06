import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: "VORTEX AI — Unified Coding Intelligence",
  description: "A focused coding workspace with Gemini-powered planning, implementation and review."
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}