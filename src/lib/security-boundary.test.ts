import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { EXPERIMENTAL_MODEL_MANIFEST, PRODUCTION_MODEL_POLICY } from "./model-integrity.ts";

test("experimental model is pinned to an immutable revision and SHA-256", () => {
  assert.match(EXPERIMENTAL_MODEL_MANIFEST.revision, /^[a-f0-9]{40}$/);
  assert.match(EXPERIMENTAL_MODEL_MANIFEST.sha256, /^[a-f0-9]{64}$/);
  assert.ok(EXPERIMENTAL_MODEL_MANIFEST.bytes > 100_000_000);
  assert.match(EXPERIMENTAL_MODEL_MANIFEST.purpose, /synthetic/i);
});

test("production model policy fails closed", () => {
  assert.equal(PRODUCTION_MODEL_POLICY.selfHostedOnly, true);
  assert.equal(PRODUCTION_MODEL_POLICY.allowRemoteResolution, false);
  assert.equal(PRODUCTION_MODEL_POLICY.requireSha256Verification, true);
  assert.equal(PRODUCTION_MODEL_POLICY.allowCloudFallback, false);
  assert.equal(PRODUCTION_MODEL_POLICY.allowPromptTelemetry, false);
  assert.equal(PRODUCTION_MODEL_POLICY.runInWorker, true);
});

test("private conversation UI contains no common analytics or error-tracking clients", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\bSentry\b|\bmixpanel\b|google-analytics|\bgtag\(|\bsegment\.|\bposthog\b|\.sendBeacon\(/i);
  assert.equal([...source.matchAll(/\bfetch\(/g)].length, 1);
  assert.match(source, /fetch\('\/api\/inference',\{method:'POST'/);
});
