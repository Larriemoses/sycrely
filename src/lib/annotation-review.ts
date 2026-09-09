import { PRIVACY_LABELS } from "./privacy-labels.ts";
import { validateTrainingRecord, type TrainingRecord, type TrainingSpan } from "./training-corpus.ts";

export type ReviewDecision = "unreviewed" | "approved" | "needs-changes" | "rejected";
export type RecordReview = { spans: TrainingSpan[]; decision: ReviewDecision; note: string; reviewer: string; updatedAt: string };
export type AuditEntry = { at: string; recordId: string; reviewer: string; action: string; detail: string };
export type ReviewStore = { schemaVersion: "1.0.0"; reviews: Record<string,RecordReview>; audit: AuditEntry[] };
export type ReviewExport = ReviewStore & { exportedAt: string; datasetRecords: number; datasetFingerprint: string };

export const REVIEW_STORAGE_KEY = "sycrely.annotation-reviews.v1";
export const EMPTY_REVIEW_STORE: ReviewStore = { schemaVersion:"1.0.0",reviews:{},audit:[] };

export function datasetFingerprint(records:TrainingRecord[]):string {
  let hash=2166136261;
  const identity=[...records].sort((a,b)=>a.id.localeCompare(b.id)).map(row=>`${row.id}\u0000${row.text}\u0000${row.split}`).join("\u0001");
  for(let index=0;index<identity.length;index++){hash^=identity.charCodeAt(index);hash=Math.imul(hash,16777619)}
  return `fnv1a32-${(hash>>>0).toString(16).padStart(8,"0")}`;
}

export function validateReviewExport(payload:unknown,records:TrainingRecord[]):string[] {
  const errors:string[]=[];
  if(!payload||typeof payload!=="object")return["Review file must contain a JSON object."];
  const value=payload as Partial<ReviewExport>;
  if(value.schemaVersion!=="1.0.0")errors.push("Unsupported review schema version.");
  if(value.datasetRecords!==records.length)errors.push(`Dataset count mismatch: expected ${records.length}.`);
  if(value.datasetFingerprint!==datasetFingerprint(records))errors.push("Dataset fingerprint mismatch. Export a fresh review file from this corpus.");
  if(!value.reviews||typeof value.reviews!=="object")return[...errors,"Review entries are missing."];
  const recordById=new Map(records.map(record=>[record.id,record]));
  for(const id of Object.keys(value.reviews))if(!recordById.has(id))errors.push(`Unknown review record: ${id}.`);
  const labels=new Set(PRIVACY_LABELS.map(label=>label.id));
  for(const record of records){
    const review=value.reviews[record.id];
    if(!review){errors.push(`${record.id} has not been reviewed.`);continue}
    if(review.decision!=="approved")errors.push(`${record.id} is ${review.decision}, not approved.`);
    if(!review.reviewer?.trim())errors.push(`${record.id} has no reviewer identity.`);
    if(!Array.isArray(review.spans)){errors.push(`${record.id} has invalid spans.`);continue}
    for(const span of review.spans)if(!labels.has(span.label))errors.push(`${record.id} uses unknown label ${span.label}.`);
    const candidate={...record,spans:[...review.spans].sort((a,b)=>a.start-b.start)};
    for(const error of validateTrainingRecord(candidate))errors.push(`${record.id}: ${error}.`);
  }
  return errors;
}

export function buildApprovedRecords(payload:ReviewExport,records:TrainingRecord[]):TrainingRecord[] {
  const errors=validateReviewExport(payload,records);
  if(errors.length)throw new Error(errors.join("\n"));
  return records.map(record=>({...record,spans:[...payload.reviews[record.id].spans].sort((a,b)=>a.start-b.start),reviewStatus:"human-reviewed-approved" as const}));
}
