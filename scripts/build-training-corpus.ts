import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ORGANIZATION_BENCHMARK } from "../src/lib/organization-benchmark.ts";
import { PRIVACY_LABEL_CONTROLS, PRIVACY_LABEL_EXPANSION } from "../src/lib/privacy-label-expansion.ts";
import { makeSpans, splitForGroup, validateTrainingRecord, type TrainingRecord, type TrainingSplit } from "../src/lib/training-corpus.ts";

type NigerianRow = {
  id: string; prompt: string; language_style: string; expected_categories: string[]; must_hide: string[];
};

const fixtureRanges = ["001-075", "076-150", "151-225", "226-300"];
const nigerianRows: NigerianRow[] = [];
for (const range of fixtureRanges) {
  const raw = await readFile(join(process.cwd(), "tests/fixtures", `nigerian-privacy-dataset-${range}.jsonl`), "utf8");
  nigerianRows.push(...raw.trim().split(/\r?\n/).map(line => JSON.parse(line) as NigerianRow));
}

const records: TrainingRecord[] = nigerianRows.map(row => {
  const number = Number(row.id.slice(3));
  const sourceGroup = `ng-template-${String(((number-1)%60)+1).padStart(2,"0")}`;
  return {
    id: row.id,
    text: row.prompt,
    languageStyle: row.language_style,
    source: "nigerian-privacy-dataset",
    sourceGroup,
    split: splitForGroup(sourceGroup),
    spans: makeSpans(row.prompt, row.must_hide, row.expected_categories),
    reviewStatus: "machine-derived-needs-human-review",
  };
});

records.push(...ORGANIZATION_BENCHMARK.map(row => {
  const sourceGroup = `organization:${row.organization}`;
  return {
    id: row.id,
    text: row.prompt,
    languageStyle: "standard-english",
    source: "organization-benchmark" as const,
    sourceGroup,
    split: splitForGroup(sourceGroup),
    spans: makeSpans(row.prompt, [row.organization], ["organization"]),
    reviewStatus: "machine-derived-needs-human-review" as const,
  };
}));

records.push(...PRIVACY_LABEL_EXPANSION, ...PRIVACY_LABEL_CONTROLS);

const ids = new Set<string>();
const prompts = new Set<string>();
for (const record of records) {
  if (ids.has(record.id)) throw new Error(`Duplicate id: ${record.id}`);
  if (prompts.has(record.text)) throw new Error(`Duplicate prompt: ${record.id}`);
  ids.add(record.id); prompts.add(record.text);
  const errors = validateTrainingRecord(record);
  if (errors.length) throw new Error(`${record.id}: ${errors.join(", ")}`);
}

const outputDirectory = join(process.cwd(), "training-data/generated");
await mkdir(outputDirectory, { recursive: true });
const splits: TrainingSplit[] = ["train","validation","test"];
for (const split of splits) {
  const rows = records.filter(record => record.split === split);
  await writeFile(join(outputDirectory, `${split}.jsonl`), `${rows.map(row => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

const counts = Object.fromEntries(splits.map(split => [split, records.filter(record => record.split === split).length]));
const summary = {
  schemaVersion: "1.0.0",
  generatedAt: "reproducible-no-timestamp",
  total: records.length,
  counts,
  spans: records.reduce((sum, row) => sum + row.spans.length, 0),
  labelCounts: Object.fromEntries([...new Set(records.flatMap(row=>row.spans.map(span=>span.label)))].sort().map(label=>[label,records.flatMap(row=>row.spans).filter(span=>span.label===label).length])),
  reviewStatus: "Every annotation requires human review before model training.",
  leakageControl: "Paraphrases sharing a template or organization stay in one split.",
};
await writeFile(join(outputDirectory, "manifest.json"), `${JSON.stringify(summary,null,2)}\n`, "utf8");
console.log(JSON.stringify(summary,null,2));
