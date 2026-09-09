import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { buildApprovedRecords, type ReviewExport } from "../src/lib/annotation-review.ts";
import type { TrainingRecord, TrainingSplit } from "../src/lib/training-corpus.ts";

const reviewPath=process.argv[2];
if(!reviewPath)throw new Error("Usage: pnpm dataset:approve <sycrely-annotation-review.json>");
const generated=join(process.cwd(),"training-data/generated");
const splits:TrainingSplit[]=["train","validation"];
const records:TrainingRecord[]=[];
for(const split of splits){
  const raw=await readFile(join(generated,`${split}.jsonl`),"utf8");
  records.push(...raw.trim().split(/\r?\n/).map(line=>JSON.parse(line) as TrainingRecord));
}
const payload=JSON.parse(await readFile(resolve(reviewPath),"utf8")) as ReviewExport;
const approved=buildApprovedRecords(payload,records);
const output=join(process.cwd(),"training-data/approved");
await mkdir(output,{recursive:true});
for(const split of splits){
  const rows=approved.filter(record=>record.split===split);
  await writeFile(join(output,`${split}.jsonl`),`${rows.map(row=>JSON.stringify(row)).join("\n")}\n`,"utf8");
}
const manifest={schemaVersion:"1.0.0",sourceFingerprint:payload.datasetFingerprint,approvedAt:payload.exportedAt,total:approved.length,counts:Object.fromEntries(splits.map(split=>[split,approved.filter(row=>row.split===split).length])),spans:approved.reduce((sum,row)=>sum+row.spans.length,0),reviewers:[...new Set(Object.values(payload.reviews).map(review=>review.reviewer))].sort(),testSplit:"Excluded and still locked."};
await writeFile(join(output,"manifest.json"),`${JSON.stringify(manifest,null,2)}\n`,"utf8");
console.log(JSON.stringify(manifest,null,2));
