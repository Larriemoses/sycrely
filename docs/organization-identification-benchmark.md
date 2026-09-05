# Organization Identification Benchmark

## Purpose

This phase strengthens local recognition of organizations before an on-device semantic model is introduced. It tests whether organization names are removed while the useful subject of the request remains intact.

## Dataset

The synthetic benchmark contains 200 distinct prompts built from:

- 25 invented companies, schools, hospitals, clinics, NGOs, unions, firms, studios, cooperatives and professional organizations
- Eight relationship forms per organization
- Names containing acronyms, suffixes, hyphens, `& Sons`, `Ltd`, `PLC`, `Co-op`, `Centre`, `Chambers` and similar structures

Relationship forms include:

- “His company is…” and equivalent her/their/our forms
- “Her employer is…”
- “Their firm is called…”
- “The business named…”
- “I work for…”
- “She works with…”
- “director of…”
- “Our organization is named…”

## Assertions

Every case must:

1. produce an `organization` finding;
2. remove the exact organization name from provider-bound text; and
3. retain the labelled useful subject such as delayed salary, workplace complaint, labour rights, contract dispute or privacy-policy guidance.

## Result

- Organization benchmark: 200/200 passed
- Exact reported salary/retaliation prompt: passed
- Complete project suite: 333/333 passed
- Lint: passed
- Production build: passed

The reported prompt now protects `Mr. Olaniyi` as `[PERSON_1]`, protects `Olabest YT & Sons` as `[ORGANIZATION_1]`, preserves the five-month salary complaint, and adds an `ambiguous-retaliation` review finding for “pay … back.”

## Limitation

This remains deterministic evaluation, not neural-model training. The generated cases provide useful future training candidates, but they must be separated into training, validation and untouched test sets before a semantic model is trained.
