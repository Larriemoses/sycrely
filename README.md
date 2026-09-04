# Sycrely

**Powerful AI. Private by design.**

Sycrely is a privacy-first AI gateway that helps people use frontier AI models without sending unnecessary personal, confidential, or identifying context to the model provider.

This repository contains the first mobile-first web prototype. It demonstrates the core privacy boundary before OpenRouter or another production inference provider is connected.

## How it works

1. The user writes normally inside Sycrely.
2. The local privacy engine checks the prompt on the device.
3. Sensitive details are removed, replaced with placeholders, or generalized.
4. High-risk requests pause for review and show the exact provider-bound text.
5. Only the protected task is sent through the inference boundary.
6. The original conversation remains encrypted in the browser.

The provider does **not** receive the user's local placeholder map or original prompt. Sycrely does not claim impossible end-to-end encrypted inference: an external model must be able to read the protected prompt it receives.

## Current prototype

- Local vault creation and unlocking
- AES-GCM encrypted browser persistence
- PBKDF2-based local key derivation
- Balanced and Strict privacy modes
- Configurable local rule catalogue covering direct identifiers, relationships, health, finance, legal matters, allegations, beliefs, politics, ethnicity, sexuality, employment, education, family, and biometrics
- Context-aware handling that preserves useful topics while protecting the identities or confidential assets attached to them
- Mandatory preview for high-sensitivity prompts
- Exact provider-bound prompt display
- Privacy trace showing what crossed the boundary
- Save-encrypted and delete-now session endings
- Responsive desktop and mobile-browser interface
- A 100-prompt synthetic privacy benchmark with automated checks for both privacy and retained usefulness
- A mock inference route that rejects forbidden original-data fields

The mock response is deliberate. OpenRouter will be integrated after the provider boundary, secret handling, quotas, and model policy are ready.

## Architecture boundary

```text
Original prompt
     |
     v
Local detection and transformation
     |
     +--> encrypted original + placeholder map remain local
     |
     v
Protected task capsule
     |
     v
Sycrely inference endpoint
     |
     v
External model provider (next phase)
```

The production privacy engine is planned as a hybrid of deterministic detectors, a compact on-device semantic classifier, and a policy engine. The current prototype implements the deterministic layer and the safety boundary.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

## Next milestones

1. Combination-risk scoring and more country-specific identifiers
2. Adversarial privacy tests and false-positive measurement
3. Compact on-device semantic classification
4. OpenRouter integration with server-side secret isolation
5. Usage accounting, model policy, rate limits, and managed credits
6. Grounded answer verification and uncertainty indicators
7. Installable PWA and expanded accessibility testing

## Status

Early private prototype. Do not use it yet for production secrets, regulated information, or safety-critical decisions.

See [Privacy Rule Catalogue](docs/privacy-rule-catalog.md) for the current local taxonomy, handling decisions, limitations, research basis, and expansion backlog.
