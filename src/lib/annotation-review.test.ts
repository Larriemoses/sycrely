import test from "node:test";
import assert from "node:assert/strict";
import { buildApprovedRecords, datasetFingerprint, validateReviewExport, type ReviewExport } from "./annotation-review.ts";
import type { TrainingRecord } from "./training-corpus.ts";

const records:TrainingRecord[]=[
  {id:"review-1",text:"Contact Ada safely.",languageStyle:"standard-english",source:"privacy-label-expansion",sourceGroup:"review:1",split:"train",spans:[{start:8,end:11,text:"Ada",label:"PERSON"}],reviewStatus:"machine-derived-needs-human-review"},
  {id:"review-2",text:"Explain privacy generally.",languageStyle:"standard-english",source:"privacy-label-expansion",sourceGroup:"review:2",split:"validation",spans:[],reviewStatus:"machine-derived-needs-human-review"},
];

function approvedExport():ReviewExport {
  return {schemaVersion:"1.0.0",exportedAt:"2026-09-09T00:00:00.000Z",datasetRecords:records.length,datasetFingerprint:datasetFingerprint(records),reviews:Object.fromEntries(records.map(record=>[record.id,{spans:record.spans,decision:"approved",note:"checked",reviewer:"Sycrely QA",updatedAt:"2026-09-09T00:00:00.000Z"}])),audit:[]};
}

test("dataset fingerprint is stable regardless of record order",()=>{
  assert.equal(datasetFingerprint(records),datasetFingerprint([...records].reverse()));
});

test("fully approved reviews become approved training records",()=>{
  const approved=buildApprovedRecords(approvedExport(),records);
  assert.equal(approved.length,2);
  assert.ok(approved.every(record=>record.reviewStatus==="human-reviewed-approved"));
});

test("approval gate rejects incomplete and stale review exports",()=>{
  const incomplete=approvedExport();delete incomplete.reviews["review-2"];
  assert.ok(validateReviewExport(incomplete,records).some(error=>error.includes("has not been reviewed")));
  const stale=approvedExport();stale.datasetFingerprint="fnv1a32-deadbeef";
  assert.ok(validateReviewExport(stale,records).some(error=>error.includes("fingerprint mismatch")));
});

test("approval gate rejects unapproved decisions and invalid spans",()=>{
  const payload=approvedExport();payload.reviews["review-1"].decision="needs-changes";
  payload.reviews["review-2"].spans=[{start:0,end:50,text:"wrong",label:"PERSON"}];
  const errors=validateReviewExport(payload,records);
  assert.ok(errors.some(error=>error.includes("not approved")));
  assert.ok(errors.some(error=>error.includes("invalid offset")));
});
