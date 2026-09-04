# Sycrely Local Privacy Rule Catalogue

Version: 2026.09.1

This catalogue is the explainable rule-based baseline for Sycrely's local privacy engine. It is not a claim of complete de-identification. A future on-device model must be evaluated against the same synthetic corpus and improve it without reducing task usefulness.

## Design principles

1. Detect direct identifiers before broad numeric patterns.
2. Use nearby context to distinguish IDs, names, dates, organizations and locations.
3. Treat affiliations as identifying relationships, not merely ordinary words.
4. Preserve health, support, legal and financial topics when they are necessary to answer the user.
5. Generalize confidential business assets when the information itself is valuable.
6. Pause for review when several ordinary facts become identifying in combination.
7. Never send the local alias map or original prompt to the inference provider.

## Implemented direct and technical identifiers

- Person names introduced through common self-identification phrases
- Email addresses
- Phone numbers
- Street addresses
- IP addresses
- Credentials, API keys and passwords
- Government identifiers with contextual labels
- Payment-card-like numbers
- Organization names introduced through ownership phrases

## Implemented relationship rules

- Student or attendee of an educational institution
- Employee or worker at an organization
- Member of a union, association or other organization
- Patient at a hospital or clinic
- Client of a lawyer, accountant or professional firm

## Implemented sensitive-context groups

- Health, therapy and medical matters
- Financial circumstances
- Legal disputes
- Criminal or misconduct allegations
- Religious or philosophical beliefs
- Political opinions and affiliations
- Race, ethnicity and nationality
- Sexual orientation and sex-life context
- Employment and disciplinary matters
- Education records and student context
- Family and relationship matters
- Biometrics and genetic data
- Confidential products, algorithms, inventions and business mechanisms

## Important limitation

Patterns cannot reliably understand every name, place, spelling error, implied relationship or novel confidential idea. Rule matches may be false positives or false negatives. The review screen and future on-device semantic model are necessary layers, not optional polish.

## Research basis

- [Microsoft Presidio supported entities](https://microsoft.github.io/presidio/supported_entities/) documents a hybrid approach using patterns, checksums, context and named-entity recognition.
- [Microsoft Presidio Analyzer](https://microsoft.github.io/presidio/analyzer/) describes configurable recognizers and context-aware enhancement.
- [Google Sensitive Data Protection infoTypes](https://docs.cloud.google.com/sensitive-data-protection/docs/concepts-infotypes) recommends contextual clues and targeted detectors for people, dates, locations, organizations and generic identifiers.
- [HHS de-identification guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html) explains that identifiers can identify a person alone or in combination and enumerates health-data identifier classes.
- [ICO special-category guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/) covers health, beliefs, politics, ethnicity, biometrics, sexuality and related sensitive contexts.
- [OWASP LLM Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) includes PII, financial, health, legal and proprietary business information in LLM disclosure risks.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework) provides the broader risk-management basis for identifying and managing privacy risk across data-processing parties.

## Expansion backlog

- Country-specific identifiers and checksums, beginning with Nigeria and initial target markets
- Dates of birth and rare-date combinations
- Coordinates, device IDs, MAC addresses, vehicle plates and crypto-wallet addresses
- Source code, connection strings, private URLs and internal hostnames
- Image, audio and document detection
- Multilingual and code-switched expressions
- Co-reference across multiple conversation turns
- Combination-risk scoring for several quasi-identifiers
- User corrections that remain local and improve future detection
