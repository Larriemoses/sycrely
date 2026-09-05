import assert from "node:assert/strict";
import test from "node:test";
import { runInference } from "./inference.ts";

const protectedRequest = {
  protectedPrompt: "Please advise [PERSON_1] about unpaid salary at [ORGANIZATION_1].",
  requestedOutput: "Practical next steps",
  constraints: ["Do not infer placeholders"],
};

test("mock mode works without a key and identifies itself", async () => {
  const result = await runInference(protectedRequest, { environment: { SYCRELY_INFERENCE_MODE: "mock" } });
  assert.equal(result.meta.mode, "mock");
  assert.match(result.message, /complete protected prompt/i);
});

test("live mode fails closed when credentials or model configuration are missing", async () => {
  await assert.rejects(
    runInference(protectedRequest, { environment: { SYCRELY_INFERENCE_MODE: "live" } }),
    /OPENROUTER_API_KEY/,
  );
  await assert.rejects(
    runInference(protectedRequest, {
      environment: { SYCRELY_INFERENCE_MODE: "live", OPENROUTER_API_KEY: "secret" },
    }),
    /OPENROUTER_MODEL/,
  );
});

test("live mode rejects a model that is not allowlisted", async () => {
  await assert.rejects(
    runInference(protectedRequest, {
      environment: {
        SYCRELY_INFERENCE_MODE: "live",
        OPENROUTER_API_KEY: "secret",
        OPENROUTER_MODEL: "vendor/unapproved",
        SYCRELY_ALLOWED_MODELS: "vendor/approved",
      },
    }),
    /not allowlisted/,
  );
});

test("live mode sends only protected content with privacy routing requirements", async () => {
  let outboundBody = "";
  let outboundHeaders: HeadersInit | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    outboundBody = String(init?.body);
    outboundHeaders = init?.headers;
    return new Response(JSON.stringify({
      model: "vendor/approved",
      provider: "Example Provider",
      choices: [{ message: { content: "Document the missed payments and contact the relevant labour authority." } }],
      usage: { prompt_tokens: 25, completion_tokens: 13, total_tokens: 38 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const result = await runInference(protectedRequest, {
    environment: {
      SYCRELY_INFERENCE_MODE: "live",
      OPENROUTER_API_KEY: "secret",
      OPENROUTER_MODEL: "vendor/approved",
      SYCRELY_ALLOWED_MODELS: "vendor/approved,vendor/backup",
    },
    fetcher,
  });

  assert.equal(result.meta.mode, "live");
  assert.equal(result.meta.usage?.totalTokens, 38);
  assert.equal(result.meta.privacy.zeroDataRetention, true);
  assert.equal(result.meta.privacy.dataCollection, "deny");
  assert.match(outboundBody, /\[PERSON_1\]/);
  assert.doesNotMatch(outboundBody, /originalText|aliasMap|Olaniyi/);
  const body = JSON.parse(outboundBody);
  assert.match(body.messages[0].content, /complete working request/);
  assert.deepEqual(body.provider, {
    zdr: true,
    data_collection: "deny",
    require_parameters: true,
    allow_fallbacks: true,
  });
  assert.deepEqual(body.reasoning, { effort: "low", exclude: true });
  assert.equal((outboundHeaders as Record<string, string>).Authorization, "Bearer secret");
});

test("retries when a reasoning-heavy provider returns no visible answer", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({
      model: "vendor/approved",
      choices: [{ message: { content: calls === 1 ? "" : "Compare location, safety, power, water, reviews, and total cost." } }],
      usage: { prompt_tokens: 20, completion_tokens: 20, total_tokens: 40 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const result = await runInference(protectedRequest, {
    environment: {
      SYCRELY_INFERENCE_MODE: "live",
      OPENROUTER_API_KEY: "secret",
      OPENROUTER_MODEL: "vendor/approved",
      SYCRELY_ALLOWED_MODELS: "vendor/approved",
    },
    fetcher,
  });
  assert.equal(calls, 2);
  assert.match(result.message, /location, safety/);
});

test("retries a weak-model claim that protected context is missing", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    const content = calls === 1
      ? "I don't have the protected context or supplied capsule data needed to answer."
      : "Start by comparing hostel security, distance, total cost, utilities, reviews, and transport. Which Nigerian city and budget range do you prefer?";
    return new Response(JSON.stringify({
      model: "vendor/approved",
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 20, completion_tokens: 20, total_tokens: 40 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const result = await runInference(protectedRequest, {
    environment: {
      SYCRELY_INFERENCE_MODE: "live",
      OPENROUTER_API_KEY: "secret",
      OPENROUTER_MODEL: "vendor/approved",
      SYCRELY_ALLOWED_MODELS: "vendor/approved",
    },
    fetcher,
  });
  assert.equal(calls, 2);
  assert.match(result.message, /hostel security/);
  assert.doesNotMatch(result.message, /capsule|protected context/i);
});

test("upstream error bodies are not exposed", async () => {
  const fetcher: typeof fetch = async () => new Response("sensitive upstream echo", { status: 429 });
  await assert.rejects(
    runInference(protectedRequest, {
      environment: {
        SYCRELY_INFERENCE_MODE: "live",
        OPENROUTER_API_KEY: "secret",
        OPENROUTER_MODEL: "vendor/approved",
        SYCRELY_ALLOWED_MODELS: "vendor/approved",
      },
      fetcher,
    }),
    (error: Error) => !error.message.includes("sensitive upstream echo") && error.message.includes("temporarily rate-limited"),
  );
});
