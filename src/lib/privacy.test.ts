import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt } from "./privacy.ts";

test("removes credentials and marks critical risk", () => {
  const result = analyzePrompt("My API key: sk-example-secret-123456789");
  assert.equal(result.risk, "critical");
  assert.equal(result.protectedText.includes("sk-example"), false);
});

test("generalizes a confidential business idea, not only its owner", () => {
  const result = analyzePrompt("My confidential product idea is a battery using a secret graphite mechanism. Help me assess the launch strategy.");
  assert.equal(result.risk, "high");
  assert.equal(result.contentPolicy, "confidential-asset");
  assert.match(result.protectedText, /\[CONFIDENTIAL_ASSET_1\]/);
  assert.doesNotMatch(result.protectedText, /graphite mechanism/i);
  assert.match(result.protectedText, /Help me assess the launch strategy/i);
});

test("protects identity but preserves necessary therapy context", () => {
  const result = analyzePrompt("I'm Olarewaju and I need therapy. I need advice on what I'm facing as a student.");
  assert.equal(result.risk, "high");
  assert.equal(result.contentPolicy, "identity-only");
  assert.match(result.protectedText, /I'm \[PERSON_1\] and I need therapy/i);
  assert.match(result.protectedText, /what I'm facing as a student/i);
  assert.doesNotMatch(result.protectedText, /Olarewaju/);
  assert.equal(result.aliases.some((alias) => alias.value === "Olarewaju"), true);
});

test("redacts a named identity without consuming nearby words", () => {
  const result = analyzePrompt("My name is Ada Lovelace and I need general advice.");
  assert.match(result.protectedText, /my name is \[PERSON_1\] and/i);
  assert.doesNotMatch(result.protectedText, /Ada Lovelace/);
});

test("leaves a public question usable", () => {
  const result = analyzePrompt("Explain how photosynthesis works");
  assert.equal(result.risk, "low");
  assert.equal(result.protectedText, "Explain how photosynthesis works");
  assert.equal(result.contentPolicy, "standard");
});

test("removes organization, address, and network identifiers", () => {
  const result = analyzePrompt("My company is Green Rocket at 42 Marina Road using 192.168.10.42");
  assert.equal(result.risk, "high");
  assert.match(result.protectedText, /\[ORGANIZATION_1\]/);
  assert.match(result.protectedText, /\[ADDRESS_1\]/);
  assert.match(result.protectedText, /\[IP_ADDRESS_1\]/);
});

test("flags sensitive meaning even without a direct identifier", () => {
  const result = analyzePrompt("Help me understand my medical record and test result");
  assert.equal(result.risk, "high");
  assert.equal(result.findings.some((finding) => finding.category === "health"), true);
});
