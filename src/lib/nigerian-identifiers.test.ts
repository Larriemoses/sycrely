import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt } from "./privacy.ts";

const cases = [
  ["NIN", "My NIN is 12345678901", "12345678901", "GOVERNMENT_IDENTIFIER_REMOVED"],
  ["BVN", "My BVN number: 10987654321", "10987654321", "FINANCIAL_IDENTIFIER_REMOVED"],
  ["VIN", "My voter identification number is 90F5B12C34567890123", "90F5B12C34567890123", "GOVERNMENT_IDENTIFIER_REMOVED"],
  ["CAC RC", "Our CAC RC number is 1234567", "1234567", "BUSINESS_IDENTIFIER_REMOVED"],
  ["business name", "BN 2865455 belongs to the business", "2865455", "BUSINESS_IDENTIFIER_REMOVED"],
  ["tax", "My tax identification number is 12345678-0001", "12345678-0001", "GOVERNMENT_IDENTIFIER_REMOVED"],
  ["bank account", "My bank account number is 0123456789", "0123456789", "FINANCIAL_IDENTIFIER_REMOVED"],
  ["matric", "My matric number is CSC/2024/0142", "CSC/2024/0142", "EDUCATION_IDENTIFIER_REMOVED"],
] as const;

for (const [name, prompt, secret, replacement] of cases) {
  test(`protects labeled Nigerian ${name} identifiers`, () => {
    const result = analyzePrompt(prompt);
    assert.doesNotMatch(result.protectedText, new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.match(result.protectedText, new RegExp(`\\[${replacement}\\]`));
    assert.equal(result.risk === "critical" || result.risk === "high", true);
  });
}

test("does not guess that an unlabeled ordinary 11-digit reference is a NIN or BVN", () => {
  const result = analyzePrompt("The public report reference is 12345678901");
  assert.equal(result.findings.some((finding) => finding.category === "government-id" || finding.category === "nigeria-financial-id"), false);
});

test("never stores high-risk Nigerian identifiers in the restorable local alias map", () => {
  const result = analyzePrompt("My NIN is 12345678901 and my BVN is 10987654321");
  assert.equal(result.aliases.some((alias) => /12345678901|10987654321/.test(alias.value)), false);
});
