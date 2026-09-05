import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { analyzePrompt } from "./privacy.ts";

type DatasetRow = {
  id: string; prompt: string; privacy_expected: boolean;
  expected_categories: string[]; must_hide: string[]; must_preserve: string[];
};

const files = ["001-075", "076-150", "151-225", "226-300"];
const rows: DatasetRow[] = files.flatMap(range => fs.readFileSync(
  path.join(process.cwd(), "tests", "fixtures", `nigerian-privacy-dataset-${range}.jsonl`), "utf8",
).trim().split(/\r?\n/).map(line => JSON.parse(line) as DatasetRow));

test("Nigerian dataset contains 300 valid, distinct, consecutive prompts", () => {
  assert.equal(rows.length, 300);
  assert.equal(new Set(rows.map(row => row.prompt)).size, 300);
  assert.equal(rows.filter(row => row.privacy_expected).length, 180);
  rows.forEach((row, index) => {
    assert.equal(row.id, `ng-${String(index + 1).padStart(3, "0")}`);
    row.must_hide.forEach(value => assert.equal(row.prompt.includes(value), true));
    row.must_preserve.forEach(value => assert.equal(row.prompt.includes(value), true));
  });
});

test("Nigerian dataset measured privacy baseline does not regress", () => {
  const metaCategories = new Set(["no-sensitive-data", "public-information"]);
  let passed = 0, leakCases = 0, falsePositives = 0, lostContextCases = 0;
  for (const row of rows) {
    const result = analyzePrompt(row.prompt);
    const found = new Set(result.findings.map(finding => finding.category));
    const missing = row.expected_categories.some(category => !metaCategories.has(category) && !found.has(category));
    const leaked = row.must_hide.some(value => result.protectedText.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    const lost = row.must_preserve.some(value => !result.protectedText.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    const falsePositive = !row.privacy_expected && result.findings.length > 0;
    if (!missing && !leaked && !lost && !falsePositive) passed += 1;
    if (leaked) leakCases += 1;
    if (lost) lostContextCases += 1;
    if (falsePositive) falsePositives += 1;
  }
  assert.ok(passed >= 191, `overall pass baseline regressed to ${passed}/300`);
  assert.ok(leakCases <= 33, `labelled leak cases increased to ${leakCases}`);
  assert.ok(falsePositives <= 16, `false positives increased to ${falsePositives}`);
  assert.ok(lostContextCases <= 11, `lost-context cases increased to ${lostContextCases}`);
});
