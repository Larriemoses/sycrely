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

The color system was subsequently refined by theme: green controls use white text in Light mode and near-black text against the brighter green in Dark mode. Active modes, send actions, primary actions, shields, and assistant avatars follow the same theme-aware contrast rule.

Theme selection now defaults to the operating system preference and listens for device-theme changes. Manual System, Light, and Dark choices live in a dedicated Settings panel rather than the conversation title bar. The interface refinement also widened and stabilized the review dialog, anchored its actions during scrolling, improved long-text wrapping, reduced mobile-header crowding, and strengthened spacing and surface hierarchy across the sidebar, conversation, and composer.

## Controlled OpenRouter inference

The inference boundary now supports real OpenRouter answers without weakening the browser-to-server request shape. Mock mode remains the safe default and makes no external request. Live mode activates only when a server-side key, selected model, and explicit model allowlist are all configured. Requests require zero-data-retention routing and deny data-collecting providers, use a response-token limit and timeout, and return a transparent model/token receipt to the interface. Upstream error bodies are never relayed to the browser.

## Current limitations

- The semantic baseline has a small synthetic reference set and is not production-ready.
- It identifies broad context but does not reliably locate every entity span for replacement.
- Deliberately extreme obfuscation and implicit names still produce measured misses.
- Mock mode remains the default; Live mode has no authentication, per-user quota, or cost ledger yet.
- Sycrely must not be used for production secrets or regulated decisions at this stage.

## Classifier calibration

A separate 48-case semantic benchmark was added with 32 sensitive paraphrases and 16 harmless controls. Baseline 0.1.0 achieved 81.25% category recall and 83.87% measured precision at roughly 1.7 ms average execution time on the development machine. The misses and false alarms remain documented rather than being hidden by lowering the test standard. A replaceable classifier interface now allows a future browser model to be evaluated against the same contract.

## Next milestones

1. Expand the calibration benchmark with Nigerian language styles and harder benign controls.
2. Evaluate a browser-sized ONNX or Transformers.js model through the classifier adapter.
3. Compare semantic recall, false-positive rate, latency, download size, and memory use on mobile devices.
4. Add authentication, quotas, managed credits, model policy, rate limiting, and abuse controls around Live mode.
6. Add grounded response verification and uncertainty indicators.
