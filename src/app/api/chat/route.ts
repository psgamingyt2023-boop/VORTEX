import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const maxDuration = 300;

type Role = "Planner" | "Builder" | "Reviewer" | "Synthesizer";
const model = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";

async function askGemini(role: Role, prompt: string, context = "") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Google Gemini is not connected yet. Add GEMINI_API_KEY in Vercel → Project Settings → Environment Variables.");
  const system: Record<Role, string> = {
    Planner: "You are VORTEX's senior software architect. Break the request into requirements, architecture, edge cases, risks and acceptance checks. Be precise.",
    Builder: "You are VORTEX's senior coding engineer. Implement the request with complete, practical code and file paths. Prefer robust, maintainable solutions.",
    Reviewer: "You are an independent principal engineer. Audit the proposed implementation for correctness, security, performance, accessibility and missing cases. Be critical and specific.",
    Synthesizer: "You are VORTEX's engineering lead. Reconcile the plan, implementation and review. Return a corrected, actionable final answer. Never claim tests ran unless they did."
  };
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model())}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system[role] }] },
      contents: [{ role: "user", parts: [{ text: prompt + (context ? "\n\nCONTEXT:\n" + context : "") }] }],
      generationConfig: { temperature: 0.2 }
    }),
    signal: AbortSignal.timeout(75000),
    cache: "no-store"
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Gemini API returned HTTP ${response.status}: ${detail}`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("\n").trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (prompt.length < 3 || prompt.length > 20000) {
      return NextResponse.json({ error: "Enter a prompt between 3 and 20,000 characters." }, { status: 400 });
    }
    const started = Date.now();
    const plan = await askGemini("Planner", prompt);
    const build = await askGemini("Builder", prompt, plan);
    const review = await askGemini("Reviewer", prompt, "PLAN:\n" + plan + "\n\nIMPLEMENTATION:\n" + build);
    const answer = await askGemini("Synthesizer", prompt, "PLAN:\n" + plan + "\n\nIMPLEMENTATION:\n" + build + "\n\nREVIEW:\n" + review);
    const code = answer.match(/```(?:tsx|ts|jsx|js|typescript|javascript)?\s*\n([\s\S]*?)```/i)?.[1]?.trim() || build.match(/```(?:tsx|ts|jsx|js|typescript|javascript)?\s*\n([\s\S]*?)```/i)?.[1]?.trim() || null;
    return NextResponse.json({
      answer, code,
      agents: [
        { role: "Planner", provider: "Google Gemini", model: model(), content: plan },
        { role: "Builder", provider: "Google Gemini", model: model(), content: build },
        { role: "Reviewer", provider: "Google Gemini", model: model(), content: review },
        { role: "Synthesizer", provider: "Google Gemini", model: model(), content: answer }
      ],
      elapsedMs: Date.now() - started
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected orchestration error.";
    return NextResponse.json({ error: message }, { status: message.includes("not connected") ? 503 : 502 });
  }
}