import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt } from "./privacy.ts";
import { FULL_PRIVACY_BENCHMARK } from "./privacy-benchmark.ts";

test("benchmark contains exactly 100 distinct prompts", () => {
  assert.equal(FULL_PRIVACY_BENCHMARK.length, 100);
  assert.equal(new Set(FULL_PRIVACY_BENCHMARK.map(item => item.input)).size, 100);
});

for (const scenario of FULL_PRIVACY_BENCHMARK) {
  test(`100-prompt benchmark: ${scenario.id}`, () => {
    const result = analyzePrompt(scenario.input);
    for (const category of scenario.expectedCategories) {
      assert.equal(result.findings.some(finding => finding.category === category), true, `missing category ${category}`);
    }
    for (const secret of scenario.mustHide ?? []) {
      assert.equal(result.protectedText.toLocaleLowerCase().includes(secret.toLocaleLowerCase()), false, `leaked ${secret}`);
    }
    for (const useful of scenario.mustKeep ?? []) {
      assert.equal(result.protectedText.toLocaleLowerCase().includes(useful.toLocaleLowerCase()), true, `lost useful context ${useful}`);
    }
  });
}
