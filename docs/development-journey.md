# Sycrely Development Journey

This journal records what was built, why decisions were made, what was verified, and what remains incomplete. It should be updated with every meaningful development milestone.

## Product boundary established

Sycrely does not promise encrypted inference against an external model. A provider must read the protected request to answer it. The product boundary is instead: original prompts and placeholder maps remain local; only a minimized task capsule crosses the provider boundary.

## Mobile-first web prototype

The first prototype established the local encrypted vault, session preservation, Balanced and Strict modes, protected previews, privacy traces, session deletion, and a mock inference endpoint. The mock endpoint deliberately rejects original-prompt and alias-map fields.

## Deterministic privacy engine

The initial local intelligence uses explicit detectors and contextual policies. It protects direct identifiers and relationships while preserving useful topics such as therapy, workplace problems, research, and legal questions. Confidential business assets receive stronger abstraction because the idea itself—not merely the founder's name—may be sensitive.

## Evaluation datasets

The repository includes a 100-prompt international benchmark, a 300-prompt Nigerian dataset, and a 200-case organization benchmark. These are evaluation datasets, not claims that a model has been trained on user data.

## Organization and multi-prompt hardening

Organization rules were broadened across ownership, employment, education, healthcare, membership, and professional-service relationships. Duplicate UI rendering keys were fixed, and multi-story prompts now retain unique transformation messages.

## Combination-risk scoring

Sycrely now warns when ordinary clues become identifying together. Its local score considers named people, organizations, affiliations, locations, exact ages, occupations, dates, small-group details, and sensitive subjects. High combination risk forces review.

## Nigerian identifier pack

Context-aware rules now protect labelled NIN, BVN, voter VIN, CAC registration, tax, bank-account, and matriculation identifiers. NIN and BVN detection requires their label because an unlabeled 11-digit value cannot safely be distinguished from other numbers.

## Adversarial and false-positive gate

A dedicated suite tests spaced and punctuated identifiers, obfuscated email addresses, Unicode names, phone formatting, and harmless lookalikes. The 24-case gate passes. The wider Nigerian benchmark improved from 191 to 193 fully passing cases, from 33 to 32 leak cases, and from 16 to 15 false-positive cases; lost-context cases remain at 11.

## Local semantic classifier baseline

The first classifier is a tiny, dependency-free character n-gram similarity engine. It runs synchronously on-device and returns categories, confidence values, a version, and timing. It is not presented as a production neural model. High-confidence results may add a review finding; low-confidence results remain advisory. Any classifier failure falls back to deterministic rules.

## Complete mock boundary and product theme

The mock endpoint originally displayed the capsule's 180-character task summary, which made longer protected requests appear incomplete. It now reads the complete protected prompt from `safeContext.protectedPrompt`; the private original and alias map still remain local. Sycrely also adopted black, charcoal, and privacy green as its default product theme, with a persistent Light/Dark control for user preference and accessibility.

The color system was subsequently refined so green controls use near-black text instead of white, while white or light surfaces use charcoal/navy rather than green text. Active modes, send actions, primary actions, shields, and assistant avatars follow the same contrast rule.

## Current limitations

- The semantic baseline has a small synthetic reference set and is not production-ready.
- It identifies broad context but does not reliably locate every entity span for replacement.
- Deliberately extreme obfuscation and implicit names still produce measured misses.
- The external inference endpoint remains a mock; no OpenRouter key is required yet.
- Sycrely must not be used for production secrets or regulated decisions at this stage.

## Next milestones

1. Expand and calibrate the classifier evaluation set.
2. Define a replaceable classifier adapter for a browser-sized ONNX or Transformers.js model.
3. Compare semantic recall, false-positive rate, latency, download size, and memory use.
4. Integrate OpenRouter with server-only credentials after the local boundary is stable.
5. Add quotas, managed credits, model policy, rate limiting, and abuse controls.
6. Add grounded response verification and uncertainty indicators.
