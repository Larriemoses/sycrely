import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PRIVACY_LABELS } from "./privacy-labels.ts";
import { splitForGroup, validateTrainingRecord, type TrainingRecord, type TrainingSplit } from "./training-corpus.ts";

const splits: TrainingSplit[] = ["train","validation","test"];

test("generated corpus has valid, non-overlapping span annotations", async () => {
  const knownLabels = new Set(PRIVACY_LABELS.map(label => label.id));
  const all: TrainingRecord[] = [];
  for (const split of splits) {
    const raw = await readFile(new URL(`../../training-data/generated/${split}.jsonl`, import.meta.url), "utf8");
    const rows = raw.trim().split(/\r?\n/).map(line => JSON.parse(line) as TrainingRecord);
    assert.ok(rows.length > 0);
    for (const row of rows) {
      assert.equal(row.split, split);
      assert.equal(row.split, splitForGroup(row.sourceGroup));
      assert.deepEqual(validateTrainingRecord(row), []);
      row.spans.forEach(span => assert.equal(knownLabels.has(span.label), true));
    }
    all.push(...rows);
  }
  assert.equal(all.length, 500);
  assert.equal(new Set(all.map(row => row.id)).size, 500);
  assert.equal(new Set(all.map(row => row.text)).size, 500);
});

test("related paraphrases cannot leak across dataset splits", async () => {
  const groupSplits = new Map<string,TrainingSplit>();
  for (const split of splits) {
    const raw = await readFile(new URL(`../../training-data/generated/${split}.jsonl`, import.meta.url), "utf8");
    for (const row of raw.trim().split(/\r?\n/).map(line => JSON.parse(line) as TrainingRecord)) {
      const existing = groupSplits.get(row.sourceGroup);
      assert.ok(!existing || existing === split, `${row.sourceGroup} leaked into ${existing} and ${split}`);
      groupSplits.set(row.sourceGroup, split);
    }
  }
});
