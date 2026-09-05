import test from "node:test";
import assert from "node:assert/strict";
import { LOCAL_MODEL_CANDIDATES, PRODUCTION_MODEL_GATE } from "./model-candidates.ts";

test("candidate catalogue has unique models and documented tradeoffs", () => {
  assert.equal(new Set(LOCAL_MODEL_CANDIDATES.map((model) => model.id)).size, LOCAL_MODEL_CANDIDATES.length);
  assert.ok(LOCAL_MODEL_CANDIDATES.some((model) => model.status === "benchmark"));
  assert.ok(LOCAL_MODEL_CANDIDATES.some((model) => model.status === "planned"));
  for (const model of LOCAL_MODEL_CANDIDATES) {
    assert.ok(model.license.length > 3);
    assert.ok(model.strengths.length > 0);
    assert.ok(model.blockers.length > 0);
  }
});

test("production gate prioritizes missed-secret prevention and mobile limits", () => {
  assert.ok(PRODUCTION_MODEL_GATE.minimumRecall >= 0.9);
  assert.ok(PRODUCTION_MODEL_GATE.minimumPrecision >= 0.9);
  assert.ok(PRODUCTION_MODEL_GATE.maximumDownloadMb <= 25);
  assert.equal(PRODUCTION_MODEL_GATE.permitsPromptTelemetry, false);
  assert.equal(PRODUCTION_MODEL_GATE.requiresOfflineAfterCache, true);
});

