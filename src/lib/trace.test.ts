import test from "node:test";
import assert from "node:assert/strict";
import { resolveTraceContext } from "./trace.ts";

test("opens the trace and delivery belonging to the clicked user message", () => {
  const messages = [
    { id: "u1", role: "user" as const, protectedText: "first protected" },
    { id: "a1", role: "assistant" as const, delivery: { model: "first-model" } },
    { id: "u2", role: "user" as const, protectedText: "second protected" },
    { id: "a2", role: "assistant" as const, delivery: { model: "second-model" } },
  ];
  const trace = resolveTraceContext(messages, "u1");
  assert.equal(trace.selected?.protectedText, "first protected");
  assert.deepEqual(trace.assistant?.delivery, { model: "first-model" });
  assert.equal(trace.position, 1);
  assert.equal(trace.total, 2);
});

test("sidebar trace defaults to the latest protected message", () => {
  const messages = [
    { id: "u1", role: "user" as const, protectedText: "first" },
    { id: "u2", role: "user" as const, protectedText: "latest" },
  ];
  assert.equal(resolveTraceContext(messages, null).selected?.id, "u2");
});
