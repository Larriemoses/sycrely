import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PRIVACY_LABELS } from "./privacy-labels.ts";
import { PRIVACY_LABEL_CONTROLS, PRIVACY_LABEL_EXPANSION } from "./privacy-label-expansion.ts";
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
  assert.equal(all.length, 572);
  assert.equal(new Set(all.map(row => row.id)).size, 572);
  assert.equal(new Set(all.map(row => row.text)).size, 572);
  const represented = new Set(all.flatMap(row => row.spans.map(span => span.label)));
  PRIVACY_LABELS.forEach(label => assert.equal(represented.has(label.id), true, `${label.id} has no training example`));
});

test("new privacy categories have deliberate train, validation, and test coverage", () => {
  const expandedLabels = new Set(PRIVACY_LABEL_EXPANSION.flatMap(row => row.spans.map(span => span.label)));
  assert.equal(expandedLabels.size, 9);
  for (const label of expandedLabels) {
    const rows = PRIVACY_LABEL_EXPANSION.filter(row => row.spans[0]?.label === label);
    assert.deepEqual(
      Object.fromEntries(splits.map(split => [split, rows.filter(row => row.split === split).length])),
      { train: 4, validation: 1, test: 1 },
    );
  }
});

test("privacy-label expansion includes harmless negative controls", () => {
  assert.equal(PRIVACY_LABEL_CONTROLS.length, 18);
  assert.ok(PRIVACY_LABEL_CONTROLS.every(row => row.spans.length === 0));
  assert.deepEqual(
    Object.fromEntries(splits.map(split => [split, PRIVACY_LABEL_CONTROLS.filter(row => row.split === split).length])),
    { train: 12, validation: 3, test: 3 },
  );
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

test("annotation workspace never loads the locked test split", async () => {
  const page = await readFile(new URL("../app/annotation-lab/page.tsx", import.meta.url), "utf8");
  assert.match(page, /"train\.jsonl", "validation\.jsonl"/);
  assert.doesNotMatch(page, /"test\.jsonl"/);
  assert.match(page, /locked test split is deliberately unavailable/i);
});
