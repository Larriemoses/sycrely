# Sycrely

Development deployment: [sycrely.vercel.app](https://sycrely.vercel.app)

**Powerful AI. Private by design.**

Sycrely is a privacy-first AI gateway that helps people use frontier AI models without sending unnecessary personal, confidential, or identifying context to the model provider.

This repository contains the first mobile-first web prototype. It demonstrates the core privacy boundary and includes an opt-in OpenRouter connection for controlled live testing.

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
- Local combination-risk scoring that warns when several ordinary details could identify someone together
- Context-aware protection for Nigerian NIN, BVN, VIN, CAC registration, tax, bank-account, and matriculation identifiers
- A dedicated adversarial gate covering disguised secrets and benign lookalikes, with measured false-positive and retained-context baselines
- A dependency-free local semantic-classifier baseline with confidence, timing, transparent review output, and rule-only fallback
- A separate 48-case semantic calibration benchmark and replaceable classifier interface
- Mandatory preview for high-sensitivity prompts
- Exact provider-bound prompt display
- Privacy trace showing what crossed the boundary
- Save-encrypted and delete-now session endings
- Responsive desktop and mobile-browser interface
- A 100-prompt synthetic privacy benchmark with automated checks for both privacy and retained usefulness
- A 200-prompt organization-identification benchmark covering 25 invented organizations and eight relationship forms
- An inference route that rejects forbidden original-data fields
- Safe-by-default Mock mode and an explicit, allowlisted OpenRouter Live mode
- OpenRouter zero-data-retention and no-data-collection routing requirements
- Model and token-usage delivery receipts in the interface

Mock remains the default so the prototype cannot create accidental AI costs. Live mode is intended for controlled development only; quotas, authentication, rate limits, and managed credits are not complete.

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
OpenRouter / external model provider (Live mode)
```

The production privacy engine is planned as a hybrid of deterministic detectors, a compact on-device semantic classifier, and a policy engine. The current prototype implements the deterministic layer and the safety boundary.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The default uses Mock mode. See [OpenRouter Integration Boundary](docs/openrouter-integration.md) to enable controlled Live mode with a server-only key.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

## Next milestones

1. Classifier calibration and browser-model candidate evaluation
2. Additional country-specific identifier packs
3. Expanded adversarial and false-positive datasets
4. Per-user usage accounting, model policy, rate limits, and managed credits
6. Grounded answer verification and uncertainty indicators
7. Installable PWA and expanded accessibility testing

## Status

Early private prototype. Do not use it yet for production secrets, regulated information, or safety-critical decisions.

See [Privacy Rule Catalogue](docs/privacy-rule-catalog.md) for the current local taxonomy, handling decisions, limitations, research basis, and expansion backlog.

See [Organization Identification Benchmark](docs/organization-identification-benchmark.md) for the dedicated entity-relationship test results.

See [Development Journey](docs/development-journey.md) for the milestone history and [Local Semantic Classifier](docs/local-semantic-classifier.md) for the current classifier contract and limitations.

See [OpenRouter Integration Boundary](docs/openrouter-integration.md) for live-inference configuration, privacy controls, and remaining production work.
