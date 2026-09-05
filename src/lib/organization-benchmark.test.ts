import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt } from "./privacy.ts";
import { ORGANIZATION_BENCHMARK } from "./organization-benchmark.ts";

test("organization benchmark contains 200 distinct prompts", () => {
  assert.equal(ORGANIZATION_BENCHMARK.length, 200);
  assert.equal(new Set(ORGANIZATION_BENCHMARK.map(item => item.prompt)).size, 200);
});

for (const scenario of ORGANIZATION_BENCHMARK) {
  test(`organization benchmark: ${scenario.id}`, () => {
    const result = analyzePrompt(scenario.prompt);
    assert.equal(result.findings.some(finding => finding.category === "organization"), true);
    assert.equal(result.protectedText.includes(scenario.organization), false, `leaked ${scenario.organization}`);
    assert.equal(result.protectedText.includes(scenario.mustKeep), true, `lost ${scenario.mustKeep}`);
  });
}

test("reported salary-retaliation prompt protects both entities and requests review", () => {
  const result = analyzePrompt("How do I pay Mr. Olaniyi back for not paying my salary for 5 months... His company is Olabest YT & Sons...");
  assert.doesNotMatch(result.protectedText, /Olaniyi|Olabest YT & Sons/);
  assert.match(result.protectedText, /\[PERSON_1\]/);
  assert.match(result.protectedText, /\[ORGANIZATION_1\]/);
  assert.equal(result.findings.some(finding => finding.category === "ambiguous-retaliation"), true);
  assert.equal(result.risk, "high");
});

test("combined workplace stories protect every named person and organization without duplicate change messages", () => {
  const result = analyzePrompt("How do I deal with Mr. Tunde Akinbayo for owing me 4 months’ salary? He owns BrightMile Logistics Ltd. My former boss Mrs. Kemi Daramola deducted money from my salary. Her company is CedarPeak Ventures. I want to report Engr. Chuka Nwosu. I work at GreenHarbour Engineering Services. Dr. Amina Sadiq at NorthBridge Medical Centre has refused to pay my salary. My manager, Mr. Femi Oladipo, accused me of stealing equipment. I work for SunVale Media House.");
  for (const secret of ["Tunde Akinbayo","Kemi Daramola","Chuka Nwosu","Amina Sadiq","Femi Oladipo","BrightMile Logistics Ltd","CedarPeak Ventures","GreenHarbour Engineering Services","NorthBridge Medical Centre","SunVale Media House"]) {
    assert.equal(result.protectedText.includes(secret), false, `leaked ${secret}`);
  }
  assert.equal(new Set(result.changes).size, result.changes.length);
});
