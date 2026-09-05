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

The first separate semantic benchmark contains 48 distinct cases: eight examples for each of the four sensitive categories and 16 benign controls. It is kept separate from the classifier's small reference set.

Baseline 0.1.0 results:

- 26 correct sensitive classifications out of 32;
- 81.25% category recall;
- 83.87% measured precision;
- five benign prompts receiving an advisory classification;
- approximately 1.7 ms average classification time on the development machine.

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
