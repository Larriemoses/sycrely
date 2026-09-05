import test from "node:test";
import assert from "node:assert/strict";
import { PRIVACY_LABELS } from "./privacy-labels.ts";

test("privacy model vocabulary has unique, documented labels", () => {
  assert.equal(PRIVACY_LABELS.length, 19);
  assert.equal(new Set(PRIVACY_LABELS.map((label) => label.id)).size, PRIVACY_LABELS.length);
  for (const label of PRIVACY_LABELS) {
    assert.match(label.id, /^[A-Z][A-Z_]+$/);
    assert.ok(label.title.length > 3);
    assert.ok(label.description.endsWith("."));
  }
});

test("irreversible secrets are never configured as restorable aliases", () => {
  const irreversible = new Set(["GOVERNMENT_ID", "PAYMENT_CARD", "CREDENTIAL", "BIOMETRIC_GENETIC"]);
  for (const label of PRIVACY_LABELS.filter((entry) => irreversible.has(entry.id))) {
    assert.equal(label.handling, "remove", `${label.id} must be removed rather than restored`);
  }
});

