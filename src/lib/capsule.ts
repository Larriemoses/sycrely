import type { ContentPolicy, PrivacyAnalysis, Risk } from "./privacy";

export type PrivacyMode = "balanced" | "strict";

export type TaskCapsule = {
  version: "1.0";
  task: string;
  safeContext: {
    protectedPrompt: string;
  };
  requestedOutput: string;
  constraints: string[];
  privacy: {
    mode: PrivacyMode;
    contentPolicy: ContentPolicy;
    policyExplanation: string;
    residualRisk: Risk;
    categories: string[];
    transformationCount: number;
  };
};

const outputIntents: Array<[RegExp, string]> = [
  [/\b(therapy|therapist|mental health|anxiety|depression|grief|trauma|emotional support)\b/i, "Supportive, non-diagnostic guidance with practical next steps"],
  [/\b(plan|strategy|roadmap|launch)\b/i, "A practical, phased plan with risks and next actions"],
  [/\b(compare|versus|vs\.?|difference)\b/i, "A clear comparison with trade-offs and a recommendation"],
  [/\b(research|investigate|evidence|sources?)\b/i, "An evidence-led research summary with uncertainty clearly marked"],
  [/\b(explain|understand|how does|what is)\b/i, "A clear explanation in plain language"],
  [/\b(list|ideas|options|suggest)\b/i, "A concise set of useful options with short explanations"],
];

function summarizeTask(protectedText: string) {
  const compact = protectedText.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) return compact;
  return `${compact.slice(0, 177).trimEnd()}...`;
}

function inferRequestedOutput(protectedText: string) {
  return outputIntents.find(([pattern]) => pattern.test(protectedText))?.[1]
    ?? "A direct, useful response that follows the protected request";
}

export function buildTaskCapsule(analysis: PrivacyAnalysis, mode: PrivacyMode): TaskCapsule {
  const contextRule = analysis.contentPolicy === "identity-only"
    ? "Keep the personal-support topic intact; do not reduce it to a vague unrelated request."
    : analysis.contentPolicy === "confidential-asset"
      ? "Work without requesting, reconstructing, or guessing the confidential asset details."
      : "Use only the protected context supplied in this capsule.";
  return {
    version: "1.0",
    task: summarizeTask(analysis.protectedText),
    safeContext: { protectedPrompt: analysis.protectedText },
    requestedOutput: inferRequestedOutput(analysis.protectedText),
    constraints: [
      "Do not guess or request the real values behind placeholders.",
      "Preserve placeholder tokens exactly as written.",
      "State uncertainty instead of inventing missing private context.",
      contextRule,
    ],
    privacy: {
      mode,
      contentPolicy: analysis.contentPolicy,
      policyExplanation: analysis.policyExplanation,
      residualRisk: analysis.risk,
      categories: [...new Set(analysis.findings.map((finding) => finding.category))],
      transformationCount: analysis.changes.filter((change) => !change.startsWith("No sensitive")).length,
    },
  };
}

export function isTaskCapsule(value: unknown): value is TaskCapsule {
  if (!value || typeof value !== "object") return false;
  const capsule = value as Partial<TaskCapsule>;
  return capsule.version === "1.0"
    && typeof capsule.task === "string"
    && capsule.task.trim().length > 0
    && capsule.task.length <= 2_000
    && typeof capsule.safeContext?.protectedPrompt === "string"
    && capsule.safeContext.protectedPrompt.trim().length > 0
    && capsule.safeContext.protectedPrompt.length <= 12_000
    && typeof capsule.requestedOutput === "string"
    && Array.isArray(capsule.constraints)
    && capsule.constraints.every((item) => typeof item === "string")
    && !!capsule.privacy
    && (capsule.privacy.mode === "balanced" || capsule.privacy.mode === "strict")
    && ["standard", "identity-only", "confidential-asset"].includes(capsule.privacy.contentPolicy);
}
