import test from "node:test";
import assert from "node:assert/strict";
import { SEMANTIC_BENCHMARK } from "./semantic-benchmark.ts";
import { localNgramClassifier } from "./semantic-classifier.ts";

test("semantic benchmark contains 96 distinct balanced cases", () => {
  assert.equal(SEMANTIC_BENCHMARK.length, 96);
  assert.equal(new Set(SEMANTIC_BENCHMARK.map((row) => row.prompt)).size, 96);
  assert.equal(SEMANTIC_BENCHMARK.filter((row) => row.expected === null).length, 32);
});

test("local semantic baseline meets its measured calibration floor", () => {
  let truePositive = 0, falsePositive = 0, falseNegative = 0, totalMs = 0;
  for (const row of SEMANTIC_BENCHMARK) {
    const result = localNgramClassifier.classify(row.prompt);
    totalMs += result.durationMs;
    const predicted = result.predictions[0]?.category ?? null;
    if (row.expected && predicted === row.expected) truePositive += 1;
    else if (row.expected) falseNegative += 1;
    else if (predicted) falsePositive += 1;
  }
  const recall = truePositive / (truePositive + falseNegative);
  const precision = truePositive / (truePositive + falsePositive);
  // This is a regression floor for the deliberately weak 0.1 baseline, not
  // the acceptance target for a production model. See the classifier spec.
  assert.ok(recall >= 0.55, `semantic recall regressed to ${recall.toFixed(3)}`);
  assert.ok(precision >= 0.75, `semantic precision regressed to ${precision.toFixed(3)}`);
  assert.ok(totalMs / SEMANTIC_BENCHMARK.length < 10, `average classification exceeded 10 ms: ${(totalMs / SEMANTIC_BENCHMARK.length).toFixed(2)} ms`);
});
