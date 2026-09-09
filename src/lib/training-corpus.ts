import { createHash } from "node:crypto";
import type { PrivacyLabelId } from "./privacy-labels.ts";

export type TrainingSplit = "train" | "validation" | "test";
export type TrainingSpan = { start: number; end: number; text: string; label: PrivacyLabelId };
export type TrainingRecord = {
  id: string;
  text: string;
  languageStyle: string;
  source: "nigerian-privacy-dataset" | "organization-benchmark" | "privacy-label-expansion";
  sourceGroup: string;
  split: TrainingSplit;
  spans: TrainingSpan[];
  reviewStatus: "machine-derived-needs-human-review" | "human-reviewed-approved";
};

export function splitForGroup(group: string): TrainingSplit {
  const bucket = createHash("sha256").update(group).digest().readUInt32BE(0) % 100;
  return bucket < 70 ? "train" : bucket < 85 ? "validation" : "test";
}

export function groupForSplit(prefix: string, split: TrainingSplit): string {
  for (let nonce=0; nonce<10_000; nonce++) {
    const group = `${prefix}:${nonce}`;
    if (splitForGroup(group) === split) return group;
  }
  throw new Error(`Unable to assign ${prefix} to ${split}`);
}

export function inferDraftLabel(text: string, value: string, categories: string[]): PrivacyLabelId {
  const lower = value.toLocaleLowerCase();
  if (/\b(?:sk-|bearer|password|secret|token|recovery phrase)/i.test(value) || categories.includes("credential")) return "CREDENTIAL";
  if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) return "EMAIL";
  if (/\b(?:https?:\/\/|(?:\d{1,3}\.){3}\d{1,3}\b)/i.test(value) || categories.includes("network")) return "NETWORK_ID";
  if (categories.includes("government-id")) return "GOVERNMENT_ID";
  if (categories.includes("address") && /\d|flat|street|road|avenue|crescent|drive|estate/i.test(value)) return "ADDRESS";
  if (categories.includes("confidential-asset") && /project|formula|internal|proprietary|secret|hidden|unreleased|acquire|plans? to/i.test(value)) return "CONFIDENTIAL_ASSET";
  if (categories.includes("financial") && /(?:₦|NGN|USD|EUR|GBP|million|billion|salary|amount)/i.test(value)) return "FINANCIAL_AMOUNT";
  if (categories.includes("phone") || /(?:\+?\d[\d\s()-]{8,}\d)/.test(value)) return "PHONE";
  if ((categories.includes("organization") || categories.some(category => ["works-at","student-of","patient-at","client-of","member-of"].includes(category))) && /fictional|\b(?:Ltd|Limited|PLC|College|Polytechnic|Clinic|Hospital|Centre|Center|Chamber|Union|Foundation|Studio|Systems|Services|Academy|Co-op|Works)\b/i.test(value)) return "ORGANIZATION";
  if (categories.includes("location") && /flat|street|road|avenue|crescent|drive|estate/i.test(lower)) return "ADDRESS";
  if (categories.includes("location") && !categories.includes("identity")) return "LOCATION";
  return "PERSON";
}

export function makeSpans(text: string, values: string[], categories: string[]): TrainingSpan[] {
  const spans: TrainingSpan[] = [];
  for (const value of values) {
    let from = 0;
    while (from < text.length) {
      const start = text.indexOf(value, from);
      if (start < 0) break;
      spans.push({ start, end: start + value.length, text: value, label: inferDraftLabel(text, value, categories) });
      from = start + value.length;
    }
  }
  return spans.sort((a,b) => a.start - b.start || b.end - a.end);
}

export function validateTrainingRecord(record: TrainingRecord): string[] {
  const errors: string[] = [];
  for (const span of record.spans) {
    if (span.start < 0 || span.end <= span.start || span.end > record.text.length) errors.push(`invalid offset ${span.start}:${span.end}`);
    if (record.text.slice(span.start, span.end) !== span.text) errors.push(`offset text mismatch for ${span.text}`);
  }
  for (let index=1; index<record.spans.length; index++) {
    if (record.spans[index].start < record.spans[index-1].end) errors.push(`overlapping spans at ${index-1}/${index}`);
  }
  return errors;
}
