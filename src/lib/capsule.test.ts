import test from "node:test";
import assert from "node:assert/strict";
import { buildTaskCapsule, isTaskCapsule } from "./capsule.ts";
import { analyzePrompt } from "./privacy.ts";

test("builds a structured capsule from protected text", () => {
  const analysis = analyzePrompt("My email is ada@example.com. Create a launch strategy.");
  const capsule = buildTaskCapsule(analysis, "balanced");
  assert.equal(isTaskCapsule(capsule), true);
  assert.doesNotMatch(capsule.safeContext.protectedPrompt, /ada@example\.com/);
  assert.match(capsule.safeContext.protectedPrompt, /\[EMAIL_1\]/);
  assert.match(capsule.requestedOutput, /phased plan/i);
});

test("capsules tell the provider not to reverse placeholders", () => {
  const capsule = buildTaskCapsule(analyzePrompt("Explain photosynthesis"), "strict");
  assert.equal(capsule.privacy.mode, "strict");
  assert.equal(capsule.constraints.some((item) => item.includes("guess")), true);
});

test("rejects an incomplete capsule", () => {
  assert.equal(isTaskCapsule({ version: "1.0", task: "Do something" }), false);
});
