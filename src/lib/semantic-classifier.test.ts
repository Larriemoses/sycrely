import test from "node:test";
import assert from "node:assert/strict";
import { classifySemanticContext } from "./semantic-classifier.ts";

test("recognizes a paraphrased confidential invention locally", () => {
  const result = classifySemanticContext("Please safeguard my unreleased invention and its proprietary cooling method before launch.");
  assert.equal(result.predictions[0]?.category, "confidential-asset");
  assert.ok(result.predictions[0].confidence >= 0.18);
});

test("recognizes retaliation meaning", () => {
  const result = classifySemanticContext("My supervisor threatened me after I complained about wages and I want advice.");
  assert.equal(result.predictions.some((prediction) => prediction.category === "allegation-retaliation"), true);
});

test("does not classify an ordinary science question", () => {
  const result = classifySemanticContext("Explain how photosynthesis converts sunlight into energy.");
  assert.deepEqual(result.predictions, []);
});

test("classification exposes its local engine and timing", () => {
  const result = classifySemanticContext("I am a patient at a named hospital and need private advice.");
  assert.equal(result.engine, "local-character-ngram-baseline");
  assert.equal(result.version, "0.1.0");
  assert.ok(result.durationMs >= 0);
});
