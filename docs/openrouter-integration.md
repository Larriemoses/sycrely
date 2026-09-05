# OpenRouter Integration Boundary

## Purpose

This layer replaces the prototype answer generator with a real external model while preserving Sycrely's main rule: only the protected task capsule may reach an AI provider.

## Request path

```text
Original message (browser only)
        |
        v
Local detectors, classifier, policy and placeholder map
        |
        +---- encrypted original remains in the local vault
        |
        v
Protected task capsule
        |
        v
/api/inference validates and rejects forbidden private fields
        |
        v
OpenRouter with ZDR required and data collection denied
        |
        v
Protected response + model/token delivery receipt
```

OpenRouter sees the protected prompt because a model must read meaningful text to answer it. It does not receive the original prompt, local alias map, raw attachments, or restored transcript through the supported request schema.

## Safe modes

- `mock` is the default. It makes no external AI request and costs nothing.
- `live` requires a server-side API key, one selected model, and an explicit model allowlist.
- A missing key/model or a model outside the allowlist fails closed. Sycrely does not silently choose another configured model.

## Local setup

Copy `.env.example` to `.env.local` and keep `.env.local` out of Git.

```dotenv
SYCRELY_INFERENCE_MODE=live
OPENROUTER_API_KEY=your_server_only_key
OPENROUTER_MODEL=provider/model-slug
SYCRELY_ALLOWED_MODELS=provider/model-slug
SYCRELY_SITE_URL=http://localhost:3000
```

Restart `pnpm dev` after changing environment variables. Never paste the API key into the browser interface, source files, GitHub, tests, screenshots, or client-side environment variables.

## Privacy routing policy

Every live request sets:

- `provider.zdr: true` to restrict routing to endpoints that support zero data retention;
- `provider.data_collection: "deny"` to exclude providers that may train on prompt data;
- `provider.require_parameters: true` so selected providers must support the requested controls;
- `provider.allow_fallbacks: true`, with privacy requirements still applying to fallback routing.

Provider metadata may still be retained by OpenRouter even when prompt logging is disabled. Therefore, Sycrely must describe this as privacy minimization—not invisible or encrypted inference.

## Operational controls already present

- 30-second timeout
- 900-token response cap
- low-temperature answer generation
- sanitized provider errors that do not relay upstream response bodies
- visible Mock/Live receipt, model name, and returned total-token count
- server-side credential use only

## Still required before public testing

1. Per-user authentication and quotas
2. Rate limiting and abuse controls
3. Budget ceilings and cost ledger
4. Model policy managed from a trusted server configuration
5. Retry policy, provider-health handling, and request identifiers
6. Production logging that never records capsule contents
7. Security review and adversarial boundary tests

