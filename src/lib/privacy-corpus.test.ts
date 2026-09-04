import test from "node:test";
import assert from "node:assert/strict";
import { PRIVACY_CORPUS } from "./privacy-corpus.ts";
import { analyzePrompt } from "./privacy.ts";

for (const example of PRIVACY_CORPUS) {
  test(`privacy corpus: ${example.id}`, () => {
    const result = analyzePrompt(example.input);
    const categories = new Set(result.findings.map((finding) => finding.category));
    for (const category of example.expectedCategories) assert.equal(categories.has(category), true, `missing ${category}`);
    for (const hidden of example.mustHide ?? []) assert.equal(result.protectedText.includes(hidden), false, `leaked ${hidden}`);
    for (const kept of example.mustKeep ?? []) assert.equal(result.protectedText.toLowerCase().includes(kept.toLowerCase()), true, `lost ${kept}`);
  });
}
