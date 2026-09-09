import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import ReviewClient from "./review-client";
import type { TrainingRecord } from "@/lib/training-corpus";

async function loadReviewableRecords() {
  const files = ["train.jsonl", "validation.jsonl"];
  const records: TrainingRecord[] = [];
  for (const file of files) {
    const raw = await readFile(join(process.cwd(), "training-data/generated", file), "utf8");
    records.push(...raw.trim().split(/\r?\n/).map(line => JSON.parse(line) as TrainingRecord));
  }
  return records;
}

export default async function AnnotationLabPage() {
  const records = await loadReviewableRecords();
  return <main className="annotation-page">
    <header className="annotation-header">
      <div><p className="eyebrow">CLASSIFIER DATA LAB</p><h1>Review privacy annotations</h1><p>Correct synthetic training labels locally. The locked test split is deliberately unavailable here.</p></div>
      <Link href="/model-lab">← Model laboratory</Link>
    </header>
    <ReviewClient records={records}/>
  </main>;
}
