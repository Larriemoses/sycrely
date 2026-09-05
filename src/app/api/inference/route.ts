import { NextResponse } from "next/server";
import { isTaskCapsule } from "@/lib/capsule";
import { runInference } from "@/lib/inference";

const forbidden = new Set([
  "originalText",
  "aliasMap",
  "rawAttachment",
  "restoredTranscript",
  "originalPrompt",
  "messages",
]);

function containsForbidden(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => forbidden.has(key) || containsForbidden(child));
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || containsForbidden(body)) {
    return NextResponse.json({ error: "Private request schema rejected." }, { status: 400 });
  }

  const capsule = (body as { taskCapsule?: unknown }).taskCapsule;
  if (!isTaskCapsule(capsule)) {
    return NextResponse.json({ error: "A valid protected task capsule is required." }, { status: 400 });
  }

  try {
    const result = await runInference({
      protectedPrompt: capsule.safeContext.protectedPrompt,
      requestedOutput: capsule.requestedOutput,
      constraints: capsule.constraints,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Protected inference failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The protected AI request could not be completed." }, { status: 502 });
  }
}
