# Nigerian 300-Prompt Dataset Report

## Dataset validation

- 300 valid JSONL records with consecutive IDs
- 300 distinct prompts and no parse errors
- 180 privacy-risk prompts and 120 benign/public controls
- Difficulty distribution: 75 straightforward, 105 moderate, 90 difficult and 30 adversarial
- 30 regional contexts and eight writing-style labels
- Every labelled `must_hide` and `must_preserve` string occurs in its source prompt

## Initial engine result

Before any changes, 111 of 300 cases satisfied all expected-category, no-leak, retained-context and no-false-positive checks. There were 172 cases where at least one labelled secret remained and nine benign prompts triggered findings.

## Current measured baseline

After the first general rule-engine improvement pass:

- 191 of 300 cases satisfy every dataset expectation
- 33 cases retain at least one labelled sensitive substring
- 16 benign controls trigger at least one finding
- 11 cases lose a labelled useful substring
- All pre-existing Sycrely regression tests remain green

Improvements include privacy-signalled natural-name detection, third-person relationship patterns, Nigerian financial amounts and test references, private hosts/routes, broader sensitive-context vocabulary, and corrected detector ordering.

## Interpretation

This dataset is an evaluation set, not yet a semantic-model training set. The engine never reads its `must_hide` labels during analysis. Remaining failures cluster around deliberately obfuscated text, multi-sentence confidential assets, implicit named entities, and benign technical examples that resemble secrets. Those cases should guide the next deterministic normalization pass and later the on-device semantic classifier.
