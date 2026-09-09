# Sycrely classifier training data

`generated/` contains reproducible annotation drafts produced by `pnpm dataset:build`. Each JSONL row includes the prompt, exact character spans, Sycrely privacy labels, provenance, grouping and a deterministic train/validation/test assignment.

The current generated corpus contains 572 prompts, 590 draft spans, and examples for all nineteen stable privacy labels. Its 109-record test split is locked away from the local annotation workspace; reviewers work only on the 403 training and 60 validation records.

These are synthetic examples and machine-derived draft annotations. They must not be used to train a release model until a human reviewer has checked every span and changed `reviewStatus` through a separate, auditable review process. Real user conversations must never be added without explicit, informed consent and documented data rights.

Leakage control keeps paraphrases from the same Nigerian template and every reuse of one fictional organization in a single split. The test split must remain untouched during model selection and training.
