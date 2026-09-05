import { CONTEXT_RULES, RELATIONSHIP_RULES } from "./privacy-rules.ts";

export type Risk = "low" | "moderate" | "high" | "critical";
export type ContentPolicy = "standard" | "identity-only" | "confidential-asset";
export type Finding = { category: string; label: string; severity: Risk };
export type AliasEntry = { token: string; value: string; category: string };
export type PrivacyAnalysis = {
  protectedText: string;
  risk: Risk;
  findings: Finding[];
  changes: string[];
  aliases: AliasEntry[];
  contentPolicy: ContentPolicy;
  policyExplanation: string;
};

type Detector = {
  category: string;
  label: string;
  severity: Risk;
  regex: RegExp;
  token: string;
  captureGroup?: number;
  keepPrefix?: number;
  restorable?: boolean;
};

const detectors: Detector[] = [
  { category: "credential", label: "Credential or secret key", severity: "critical", regex: /\b(?:sk-[a-z0-9_-]{12,}|api[_ -]?key\s*[:=]\s*\S+|password\s*[:=]\s*\S+)\b/gi, token: "CREDENTIAL_REMOVED" },
  { category: "email", label: "Email address", severity: "high", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, token: "EMAIL", restorable: true },
  { category: "network", label: "IP address", severity: "high", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, token: "IP_ADDRESS", restorable: true },
  { category: "network", label: "Private hostname or endpoint", severity: "critical", regex: /\b(?:https?:\/\/)?[a-z0-9.-]+\.(?:internal|local|test)(?:\/[\w./-]*)?/gi, token: "PRIVATE_ENDPOINT_REMOVED" },
  { category: "network", label: "Private route", severity: "critical", regex: /\/(?:ops|admin|internal|private)[\w/-]*/gi, token: "PRIVATE_ENDPOINT_REMOVED" },
  { category: "identity", label: "Named identity", severity: "high", regex: /\b([Mm]y [Nn]ame [Ii]s)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g, token: "PERSON", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "identity", label: "Named identity", severity: "high", regex: /\b(I(?:['’]m| am)|[Cc]all me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g, token: "PERSON", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "identity", label: "Named identity", severity: "high", regex: /\b((?:Mr|mr|Mrs|mrs|Ms|ms|Miss|miss|Dr|dr|Prof|prof|Chief|chief|Barrister|barrister|Engr|engr|Pastor|pastor|Imam|imam)\.?)\s+(\p{Lu}[\p{L}\p{M}'’-]+(?:\s+\p{Lu}[\p{L}\p{M}'’-]+){0,2})/gu, token: "PERSON", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b([Mm]y (?:company|startup|business|employer) is)\s+([A-Z][\w&.-]+(?:\s+[A-Z][\w&.-]+){0,3})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b((?:[Mm]y|[Hh]is|[Hh]er|[Tt]heir|[Oo]ur)\s+(?:company|organization|startup|business|employer|firm|agency|school|hospital|clinic|NGO|union)\s+(?:is called|is named|is))\s+([A-Z][\w'-]*(?:\s+(?:&\s+)?[A-Z][\w'-]*){0,7})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b((?:[Tt]he\s+)?(?:company|startup|business|employer|firm|agency|school|hospital|clinic|NGO|union)\s+(?:called|named))\s+([A-Z][\w'-]*(?:\s+(?:&\s+)?[A-Z][\w'-]*){0,7})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b(I work for|I am employed at|works for|works with|consults for|interns at)\s+([A-Z][\w'-]*(?:\s+(?:&\s+)?[A-Z][\w'-]*){0,7})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b((?:CEO|director|founder|owner|manager|chairperson)\s+(?:of|at))\s+([A-Z][\w'-]*(?:\s+(?:&\s+)?[A-Z][\w'-]*){0,7})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Private organization name", severity: "high", regex: /\b(owns|founded|runs|leads)\s+([A-Z][\w&'-]*(?:\s+[A-Z][\w&'-]*){0,5})/g, token: "ORGANIZATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "organization", label: "Explicitly fictional private organization", severity: "high", regex: /\b[A-Z][\w&'-]*(?:\s+[A-Z][\w&'-]*){0,8}\s+\(fictional\)/g, token: "ORGANIZATION", restorable: true },
  { category: "location", label: "Named location", severity: "high", regex: /\b((?:company|office|workplace|business|employer)\s+(?:which\s+)?is\s+located\s+in|(?:company|office|workplace|business|employer)\s+(?:which\s+)?is\s+Located\s+in)\s+([A-Z][\w'.-]+(?:\s+[A-Z][\w'.-]+){0,2}(?:,\s*[A-Z][\w'.-]+(?:\s+[A-Z][\w'.-]+){0,2})?)/g, token: "LOCATION", captureGroup: 2, keepPrefix: 1, restorable: true },
  { category: "address", label: "Street address", severity: "high", regex: /\b\d{1,6}\s+(?:[A-Z][\w.-]+\s+){0,4}(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Boulevard|Blvd)\b/gi, token: "ADDRESS", restorable: true },
  { category: "government-id", label: "Government identifier", severity: "critical", regex: /\b(?:SSN|NIN|passport(?: number)?|national id)\s*[:#-]?\s*[A-Z0-9-]{5,}\b/gi, token: "GOVERNMENT_IDENTIFIER_REMOVED" },
  { category: "government-id", label: "Passport or travel-document reference", severity: "critical", regex: /\bPPT-FICT-[A-Z0-9-]+\b/gi, token: "GOVERNMENT_IDENTIFIER_REMOVED" },
  { category: "finance", label: "Private financial reference", severity: "critical", regex: /\b(?:ACCT|WALLET)-TEST-[A-Z0-9-]+\b/gi, token: "FINANCIAL_IDENTIFIER_REMOVED" },
  { category: "finance", label: "Exact financial amount", severity: "high", regex: /\bNGN\s+[\d,.]+(?:\s+(?:million|billion))?\b/gi, token: "FINANCIAL_AMOUNT", restorable: true },
  { category: "sensitive-reference", label: "Sensitive case, genetic, or biometric reference", severity: "critical", regex: /\b(?:CASE-FICT|GENE-TEST|FPT-TEST|FACE-EMBED-TEST)-?[A-Z0-9:/.-]*\b/gi, token: "SENSITIVE_REFERENCE_REMOVED" },
  { category: "education", label: "Exact academic result", severity: "high", regex: /\b\d\.\d{2}\/\d\.\d{2}\b/g, token: "ACADEMIC_RESULT", restorable: true },
  { category: "credential", label: "Credential or signing secret", severity: "critical", regex: /\b(?:PWD_TEST_ONLY|INTERNAL_SIGNING_SALT_TEST)_[A-Z0-9_]+\b/g, token: "CREDENTIAL_REMOVED" },
  { category: "finance", label: "Payment card pattern", severity: "critical", regex: /\b(?:4(?:[ -]*\d){15}|5[1-5](?:[ -]*\d){14})\b/g, token: "FINANCIAL_IDENTIFIER_REMOVED" },
  { category: "phone", label: "Phone number", severity: "high", regex: /(?<!\w)(?:\+?\d[\d\s().-]{8,}\d)(?!\w)/g, token: "PHONE", restorable: true },
];

const personalSupport = /\b(therapy|therapist|counsell?ing|emotional support|mental health|anxiety|depression|grief|trauma|what i(?:'m| am) facing)\b/i;
const confidentialSignal = /\b(confidential|secret|hidden|unpublished|unreleased|proprietary|not announced|not launched|do not share|not exposed|protect(?:ed)? idea|private (?:idea|strategy|research)|before any public announcement)\b/i;
const businessAsset = /\b(product idea|business idea|invention|algorithm|formula|prototype|mechanism|technical design|business model|research idea|technology|unique feature|designed? a|method|project|pricing|launch plan|ranking score|board note|acquire|acquisition)\b/i;
const businessContext = /\b(company|startup|business|product|customer|market|launch|revenue|commercial|founder|employer|institute|research house|logistics|foods|co-op|repository|board)\b/i;
const requestStart = /\b(help me|please|create|develop|suggest|explain|evaluate|assess|plan|compare|list|give me)\b/i;

function applyDetector(text: string, detector: Detector, aliases: AliasEntry[]) {
  let matchNumber = 0;
  detector.regex.lastIndex = 0;
  const found = detector.regex.test(text);
  detector.regex.lastIndex = 0;
  if (!found) return { text, found: false };

  const transformed = text.replace(detector.regex, (...parts: unknown[]) => {
    matchNumber += 1;
    const whole = String(parts[0]);
    const secret = detector.captureGroup ? String(parts[detector.captureGroup]) : whole;
    const token = detector.token.endsWith("_REMOVED") ? `[${detector.token}]` : `[${detector.token}_${matchNumber}]`;
    if (detector.restorable) aliases.push({ token, value: secret, category: detector.category });
    const prefix = detector.keepPrefix ? `${String(parts[detector.keepPrefix])} ` : "";
    return `${prefix}${token}`;
  });
  return { text: transformed, found: true };
}

function applyRelationshipRules(text: string, aliases: AliasEntry[], findings: Finding[], changes: string[]) {
  let transformed = text;
  const counters: Record<string, number> = {};
  for (const rule of RELATIONSHIP_RULES) {
    rule.pattern.lastIndex = 0;
    let found = false;
    transformed = transformed.replace(rule.pattern, (...parts: unknown[]) => {
      found = true;
      counters[rule.token] = (counters[rule.token] ?? 0) + 1;
      const token = `[${rule.token}_${counters[rule.token]}]`;
      aliases.push({ token, value: String(parts[rule.valueGroup]), category: rule.id });
      return `${String(parts[rule.prefixGroup])} ${token}`;
    });
    if (found) {
      findings.push({ category: rule.id, label: rule.label, severity: "high" });
      findings.push({ category: "organization", label: "Private organization name", severity: "high" });
      changes.push(`${rule.label} was replaced locally because relationships can identify a person.`);
    }
  }
  return transformed;
}

function applyContextualProperNames(text: string, input: string, aliases: AliasEntry[], findings: Finding[], changes: string[]) {
  const privacySignal = /\b(private|privately|privte|confidential|confidentia|privacy|protect|redact|hide|sensitive|remove only|remve|identfy|does not need (?:the )?(?:person|person's|organisation|organization).*identity)\b/i;
  if (!privacySignal.test(input)) return text;
  const pattern = /\b(\p{Lu}[\p{Ll}\p{M}'’-]{1,}(?:\s+\p{Lu}[\p{Ll}\p{M}'’-]{1,}){1,2})\b/gu;
  let count = aliases.filter(alias => alias.category === "identity").length;
  let found = false;
  const transformed = text.replace(pattern, (name) => {
    count += 1;
    found = true;
    const token = `[PERSON_${count}]`;
    aliases.push({ token, value: name, category: "identity" });
    return token;
  });
  if (found) {
    findings.push({ category: "identity", label: "Contextual named identity", severity: "high" });
    changes.push("A natural-language proper name was replaced because the prompt was explicitly marked private.");
  }
  return transformed;
}

function abstractConfidentialBusinessAsset(input: string, aliases: AliasEntry[]) {
  if (!confidentialSignal.test(input) || !businessAsset.test(input) || !businessContext.test(input)) {
    return { text: input, changed: false };
  }

  const sentences = input.split(/(?<=[.!?])\s+/);
  let changed = false;
  const text = sentences.map((sentence) => {
    if (changed || !businessAsset.test(sentence)) return sentence;
    changed = true;
    const request = sentence.match(requestStart);
    const privatePart = request?.index && request.index > 0 ? sentence.slice(0, request.index).trim() : sentence.trim();
    const publicRequest = request?.index && request.index > 0 ? ` ${sentence.slice(request.index).trim()}` : "";
    aliases.push({ token: "[CONFIDENTIAL_ASSET_1]", value: privatePart, category: "confidential-asset" });
    return `A private organization is developing [CONFIDENTIAL_ASSET_1], whose distinguishing details remain local.${publicRequest}`;
  }).join(" ");
  return { text, changed };
}

export function analyzePrompt(input: string, mode: "balanced" | "strict" = "balanced"): PrivacyAnalysis {
  const findings: Finding[] = [];
  const changes: string[] = [];
  const aliases: AliasEntry[] = [];
  const abstraction = abstractConfidentialBusinessAsset(input, aliases);
  let protectedText = abstraction.text;
  let contentPolicy: ContentPolicy = "standard";
  let policyExplanation = "Unnecessary identifiers are protected while useful task context is preserved.";

  if (abstraction.changed) {
    contentPolicy = "confidential-asset";
    policyExplanation = "The valuable business concept is generalized because the idea itself could be exposed.";
    findings.push({ category: "confidential-asset", label: "Confidential business asset", severity: "high" });
    changes.push("The distinctive business idea was replaced with a local confidential-asset placeholder.");
  } else if (personalSupport.test(input)) {
    contentPolicy = "identity-only";
    policyExplanation = "Identity is protected, but the personal-support topic stays because it is necessary for a useful answer.";
    findings.push({ category: "personal-support", label: "Personal support context preserved", severity: "high" });
    changes.push("The support topic was intentionally preserved while identity details were protected.");
  }

  protectedText = applyRelationshipRules(protectedText, aliases, findings, changes);

  for (const detector of detectors) {
    const result = applyDetector(protectedText, detector, aliases);
    protectedText = result.text;
    if (result.found) {
      findings.push({ category: detector.category, label: detector.label, severity: detector.severity });
      changes.push(`${detector.label} was removed or replaced locally.`);
    }
  }

  protectedText = applyContextualProperNames(protectedText, input, aliases, findings, changes);

  for (const context of CONTEXT_RULES) {
    if (context.pattern.test(input) && !findings.some((finding) => finding.category === context.id)) {
      findings.push({ category: context.id, label: context.label, severity: context.severity });
      changes.push(`${context.label} was ${context.handling === "preserve" ? "preserved as useful context" : "flagged for review"}.`);
    }
  }

  if (mode === "strict") {
    protectedText = protectedText.replace(/\b(?:exactly|specifically|located at|working with)\b/gi, "").replace(/\s{2,}/g, " ").trim();
    changes.push("Strict mode minimized unnecessary specificity.");
  }

  const ranks: Risk[] = ["low", "moderate", "high", "critical"];
  let risk: Risk = findings.length ? "moderate" : "low";
  for (const finding of findings) if (ranks.indexOf(finding.severity) > ranks.indexOf(risk)) risk = finding.severity;

  return {
    protectedText,
    risk,
    findings,
    changes: changes.length ? changes : ["No sensitive transformation was necessary."],
    aliases,
    contentPolicy,
    policyExplanation,
  };
}
