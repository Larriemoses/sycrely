# Sycrely Classifier Training Pipeline

## Purpose

The local classifier must locate sensitive spans before an external answer provider receives a prompt. It is a privacy control, so missed sensitive data is more serious than an unnecessary review. The model assists deterministic rules; it never removes the fail-closed review path.

## Data flow

1. Start with synthetic or explicitly consented examples.
2. Create exact character spans using the stable Sycrely privacy vocabulary.
3. Keep source, language style, and template family with every record.
4. Group related paraphrases before splitting the data.
5. Human reviewers accept, correct, or reject every draft annotation.
6. Freeze the test split before model selection.
7. Tokenize spans into BIO labels only inside the training implementation.
8. Train and calibrate on train/validation data.
9. Evaluate once against the locked test set and separate adversarial suites.
10. Export the accepted model to ONNX, quantize it, hash every artifact, and test it in the same-origin browser laboratory.

## Current generated corpus

Run `pnpm dataset:build` to reproduce the files in `training-data/generated/`.

| Split | Records | Permitted use |
| --- | ---: | --- |
| Train | 355 | Weight updates |
| Validation | 48 | Thresholds, calibration, and model choice |
| Test | 97 | Final measurement only |

The 500 records contain 536 draft spans. Some harmless prompts intentionally contain zero spans. The present corpus covers ten of the nineteen privacy labels; the remaining labels need dedicated synthetic and consented examples before training.

## Human review contract

For every prompt, a reviewer must check:

- whether every sensitive span is marked;
- whether boundaries include only the sensitive words;
- whether the selected privacy label is correct;
- whether contextual information should be preserved, generalized, or reviewed;
- whether overlapping concepts need one span or separate spans;
- whether the language, dialect, spelling, and region metadata are accurate;
- whether the example is synthetic or backed by explicit consent and data rights.

Reviewers must never see the locked test labels while improving training examples. Corrections require reviewer identity, timestamp, reason, previous value, and new value in an append-only audit record.

## Release gates

- At least 90% span recall and 90% precision overall.
- Separate recall reporting for every privacy label and language group.
- Zero known credential, payment-card, or government-ID leaks in critical adversarial tests.
- Mobile memory, first-load, warm-load, and inference measurements.
- No prompt telemetry, cloud fallback, or remote model resolution.
- Deterministic rules remain active for structured identifiers.
- Low confidence, unsupported language, model failure, or disagreement enters user review.

The current 135 MB multilingual NER model does not meet these gates. It is a technical baseline for browser execution, not Sycrely's production classifier.
