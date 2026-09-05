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

test("personal support capsules preserve the useful topic", () => {
  const analysis = analyzePrompt("I'm Olarewaju and I need therapy as a student.");
  const capsule = buildTaskCapsule(analysis, "balanced");
  assert.equal(capsule.privacy.contentPolicy, "identity-only");
  assert.match(capsule.safeContext.protectedPrompt, /therapy as a student/i);
  assert.match(capsule.requestedOutput, /supportive, non-diagnostic guidance/i);
  assert.equal(capsule.constraints.some((item) => item.includes("personal-support topic")), true);
});

test("rejects an incomplete capsule", () => {
  assert.equal(isTaskCapsule({ version: "1.0", task: "Do something" }), false);
});

test("keeps the complete protected prompt even when the task summary is shortened", () => {
  const prompt = `Explain this protected research request: ${"useful context ".repeat(30)}`.trim();
  const capsule = buildTaskCapsule(analyzePrompt(prompt), "balanced");
  assert.ok(capsule.task.length <= 180);
  assert.equal(capsule.safeContext.protectedPrompt, prompt);
});
