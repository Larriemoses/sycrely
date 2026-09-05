# Local Semantic Classifier

## Purpose

The classifier complements deterministic rules when wording is indirect, misspelled, paraphrased, or unusually punctuated. The original prompt is processed locally and is never sent to an external model for privacy classification.

## Version 0.1 baseline

The current engine normalizes text, generates character trigrams, and compares them with small synthetic reference groups using the Sørensen–Dice similarity score. It recognizes four broad categories:

- sensitive personal context;
- confidential business assets;
- allegations or retaliation;
- identifying affiliations.

The result contains the engine name, version, predictions, confidence values, closest synthetic example, and local execution time.

## Decision policy

- Deterministic detectors remain authoritative for exact identifiers and replacements.
- Classifier predictions of 42% or greater may create a high-risk review finding.
- Lower-confidence predictions are advisory and visible in the review interface.
- A classifier exception produces an empty result and the rule engine continues normally.
- The provider never receives the matched example or original prompt.

The confidence value is a similarity measurement, not a calibrated probability. The interface uses a percentage for readability, but it must not be described as certainty.

## Upgrade interface

A future browser model must preserve the same basic contract: local input, category scores, version metadata, bounded execution time, and failure-safe fallback. Candidate models must be evaluated before adoption rather than selected by marketing claims.

## Acceptance criteria for a production candidate

- It improves recall on held-out obfuscated and implicit-language cases.
- It does not regress the existing deterministic suites.
- Its false-positive rate is measured on benign controls.
- It meets an agreed mobile download, memory, and latency budget.
- It works offline after model assets are cached.
- No prompt telemetry, raw examples, or model inputs leave the device.
- Users can see whether a decision came from rules, the classifier, or both.

## Calibration benchmark

The semantic benchmark now contains 96 distinct cases: 16 examples for each of the four sensitive categories and 32 benign controls. The second half adds Nigerian English, Pidgin, Yoruba-, Hausa-, and Igbo-mixed phrasing plus harder benign controls. It is kept separate from the classifier's small reference set.

Baseline 0.1.0 results on the original 48-case calibration set:

- 26 correct sensitive classifications out of 32;
- 81.25% category recall;
- 83.87% measured precision;
- five benign prompts receiving an advisory classification;
- approximately 1.7 ms average classification time on the development machine.

Results on the expanded 96-case challenge set:

- 37 correct sensitive classifications out of 64;
- 57.81% category recall;
- 78.72% measured precision;
- ten benign prompts receiving an advisory classification;
- approximately 0.6 ms average classification time on the development machine.

The lower challenge-set result is intentional evidence that the n-gram baseline is not the production classifier. Its automated threshold only prevents this known baseline from silently becoming worse. A candidate on-device model must meet the separate 90% recall and precision targets below without learning from the held-out benchmark.

The main confusion areas are general descriptions of hospitals, workplace regulation, public marketing, definitions of allegation, and generic business plans. The classifier therefore remains advisory at lower confidence. Exact identifiers continue to be handled by deterministic rules.

## Proposed mobile budget

A browser-model candidate should initially target:

- no more than 25 MB compressed download;
- no more than 150 MB peak additional memory on a representative mobile browser;
- under 100 ms median classification time after loading;
- offline operation after the model is cached;
- at least 90% recall and 90% precision on a larger held-out set;
- no regression across the existing privacy, utility, and false-positive gates.

These are engineering targets rather than current measured guarantees. They may be revised after testing on real low- and mid-range devices.

## Model output vocabulary

The stable span-label catalogue is defined in `src/lib/privacy-labels.ts`. It covers direct identifiers, contextual affiliations, private health and employment details, confidential assets, and exact private financial amounts. Each label specifies whether the normal action is to create a restorable local alias, remove the value permanently, generalize it, or require review.

The distinction matters: a phone number is sensitive by its shape, while a person, organization, location, health term, or business idea depends on why it appears. A future model must return exact character spans and these labels; the policy engine—not the model alone—decides the final transformation.
