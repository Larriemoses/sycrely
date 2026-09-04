# Sycrely 100-Prompt Privacy Benchmark

## Purpose

This benchmark checks two requirements for every prompt:

1. Expected sensitive categories must be detected and specified secrets must not appear in provider-bound text.
2. Necessary meaning specified by the test must remain, so privacy protection does not make the AI request useless.

All examples are synthetic. Names and organizations are invented test data.

## Coverage

The 100 distinct English-language prompts cover:

- Nigerian, African, European, Asian, North American and Australian scenarios
- Unicode and accented names, including Élodie, José, Łucja, Müller and Lucía
- Nigerian and international phone-number formats
- Students, employees, executives, patients, members and professional-service clients
- Schools, workplaces, hospitals, unions, law firms and company locations
- Email, phone, street address, IP address, government ID and payment-card patterns
- Health, therapy, finance, legal disputes, allegations, employment, education, family, religion, politics, sexuality, biometrics and genetics
- Confidential algorithms, formulas, prototypes, methods and product ideas
- Mixed prompts containing several identifiers and sensitive contexts at once

## Automated assertions

Each case declares:

- `expectedCategories`: classifications that must appear
- `mustHide`: exact sensitive strings that must not survive transformation
- `mustKeep`: useful context that must remain in provider-bound text

The suite also proves that there are exactly 100 distinct prompt strings. It runs locally with:

```bash
pnpm test
```

## Gaps discovered and corrected

The first run found 19 failing cases. Fixes included:

- capitalization-safe relationship phrases such as “My employer is”
- titled Unicode names and regional titles such as Chief, Barrister and Engr
- broader workplace, family, medical, legal and financial wording
- correct detector priority for government IDs, cards and phone numbers
- tighter payment-card structures so a Nigerian `+234` number is treated as a phone

After these corrections, all 100 benchmark scenarios pass.

## What a pass does not mean

This is a deterministic synthetic regression benchmark, not proof that Sycrely understands every language or every possible sentence. It does not yet cover free-form multilingual prompts, deliberate evasion, misspellings at scale, attachments, images, speech, or information revealed gradually across many messages. Those require adversarial testing and the planned on-device semantic layer.
