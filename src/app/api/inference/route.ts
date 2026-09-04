import { NextResponse } from "next/server";
import { isTaskCapsule } from "@/lib/capsule";

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

  await new Promise((resolve) => setTimeout(resolve, 450));
  return NextResponse.json({
    message: `This is Sycrely's protected prototype response. I received a structured task capsule asking for: "${capsule.requestedOutput}". The protected task was: "${capsule.task}". Your original prompt and local placeholder map were not included.`,
  });
}
