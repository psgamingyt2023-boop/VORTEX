import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  const ready = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({
    app: "VORTEX AI",
    ready,
    configuredProviders: ready ? 1 : 0,
    provider: ready ? "Google Gemini via AI Studio" : null,
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    setupRequired: !ready
  });
}