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
| Train | 403 | Weight updates |
| Validation | 60 | Thresholds, calibration, and model choice |
| Test | 109 | Final measurement only |

The 572 records contain 590 draft spans. Some harmless prompts intentionally contain zero spans. All nineteen privacy labels now have at least one dedicated synthetic example. The nine formerly missing categories each have four training examples, one validation example, and one locked test example, plus eighteen new harmless controls. Coverage does not mean readiness: every example still requires human review, and six examples per new category are only a foundation for broader multilingual collection.

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

## Local annotation workspace

The development-only `/annotation-lab` workspace exposes the 403 training and 60 validation records but never loads the 109 locked test records. A reviewer can search and filter prompts, inspect highlighted spans, select a missed phrase, add one of the nineteen stable privacy labels, relabel or remove a draft span, leave a note, and approve, reject, or request changes.

Review state and its append-only action history remain in browser storage. The reviewer can export a JSON audit file for controlled merging into a future approved corpus. The application does not send annotation activity to Sycrely, analytics, or an external model. Production collaboration will require authenticated reviewers, encrypted project storage, access controls, and a reviewed import process; local browser storage is intentionally only the prototype boundary.

The repository now includes that controlled import boundary. Each export carries a deterministic fingerprint of all reviewable IDs, prompts, and splits. `pnpm dataset:approve <review-file>` fails closed if the export belongs to another corpus, contains unknown records or labels, omits a record, lacks reviewer identity, retains a non-approved decision, or contains invalid or overlapping offsets. Only a completely approved 403-record training split and 60-record validation split can be written to `training-data/approved/`; the test split remains excluded.

## Release gates

- At least 90% span recall and 90% precision overall.
- Separate recall reporting for every privacy label and language group.
- Zero known credential, payment-card, or government-ID leaks in critical adversarial tests.
- Mobile memory, first-load, warm-load, and inference measurements.
- No prompt telemetry, cloud fallback, or remote model resolution.
- Deterministic rules remain active for structured identifiers.
- Low confidence, unsupported language, model failure, or disagreement enters user review.

The current 135 MB multilingual NER model does not meet these gates. It is a technical baseline for browser execution, not Sycrely's production classifier.
