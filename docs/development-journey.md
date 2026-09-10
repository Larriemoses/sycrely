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

The first controlled live test used OpenRouter's free-model router with a harmless, already-protected student-stress request. OpenRouter selected `inclusionai/ling-3.0-flash-sante:free` through Novita and returned a complete answer with a 680-token usage receipt. This confirms that the live provider path, privacy routing request, response parsing, and transparent delivery metadata work together. It does not replace a provider-policy audit or production security review.

## Conversation interaction refinement

The workspace now provides clickable protected-task starters, clear hover/pressed/focus/selected/disabled states, an auto-growing composer, keyboard guidance, a local-protection readiness signal, animated secure-thinking feedback, message entrance motion, and clearer delivery receipts. Motion is intentionally restrained and disabled when the device requests reduced motion. Mobile layouts reduce density without hiding the central privacy state.

## Live-answer resilience and dark-theme contrast

A live hostel-recommendation test exposed two weaknesses of free-model routing: one selected model incorrectly treated a hidden name as missing task context, while another could consume its output allowance in reasoning and return no visible answer. The provider instruction now defines the protected prompt as the complete working request, forbids internal-capsule commentary, and tells models to provide useful general guidance before asking for genuinely necessary preferences. Sycrely retries once when it detects a false missing-context refusal or an empty visible response, requests low reasoning effort, excludes hidden reasoning, and allows up to 1,200 answer tokens. HTTP 429 responses receive one short retry and then produce a clear free-capacity message.

The color audit also moved Dark mode from green-tinted surfaces to neutral black and charcoal. Green is now reserved for privacy indicators and primary actions. Primary action text is white in both themes, while secondary buttons have explicit readable colors for Light, Dark, hover, and disabled states.

## Landlord-payment privacy regression and repository naming

A screenshot of the live Privacy Trace revealed that a Nigerian landlord-message prompt protected the person's name but missed a Crescent street address, a locally formatted phone number introduced as “my number,” and an alphanumeric account reference. The detector catalogue now covers these forms, including common address suffixes and an optional locality following the street. A permanent regression test uses the complete reported scenario and requires all four direct identifiers to disappear while preserving the payment-dispute purpose. Failed provider calls are now labelled as delivery notices, and their trace reports a failed external attempt instead of incorrectly identifying the response as Mock mode.

The GitHub repository was renamed from the misspelled `secrely` to the product's canonical spelling, `sycrely`.

## Customer-delivery privacy regression

A delivery-message test revealed that an unlabelled Nigerian mobile number could pass through when written after customer details. The same scenario also contained a customer's name and exact naira amounts. The local detector catalogue now protects customer, client, patient, tenant, employee, and recipient identities when introduced as names or details; common Nigerian mobile formats; and exact naira amounts. A permanent regression test requires all four sensitive fields to be replaced while preserving the useful request, item description, and message-writing instruction.

Provider privacy controls are routing requirements, not end-to-end encrypted inference. `ZDR required` asks OpenRouter to use only an endpoint marked for zero data retention, while `data collection denied` excludes endpoints marked as collecting prompts for training or similar use. The selected provider must still read the protected capsule in memory to answer it, and routing or usage metadata may still exist. Sycrely therefore sends only the locally transformed version and must never describe these controls as making the provider unable to see that version.

## Current limitations

- The semantic baseline has a small synthetic reference set and is not production-ready.
- It identifies broad context but does not reliably locate every entity span for replacement.
- Deliberately extreme obfuscation and implicit names still produce measured misses.
- Mock mode remains the default; Live mode has no authentication, per-user quota, or cost ledger yet.
- Sycrely must not be used for production secrets or regulated decisions at this stage.

## Classifier calibration

A separate 48-case semantic benchmark was added with 32 sensitive paraphrases and 16 harmless controls. Baseline 0.1.0 achieved 81.25% category recall and 83.87% measured precision at roughly 1.7 ms average execution time on the development machine. The misses and false alarms remain documented rather than being hidden by lowering the test standard. A replaceable classifier interface now allows a future browser model to be evaluated against the same contract.

## Next milestones

1. Evaluate a browser-sized ONNX or Transformers.js model through the classifier adapter.
2. Compare semantic recall, false-positive rate, latency, download size, and memory use on mobile devices.
3. Fine-tune the best licence-compatible candidate on synthetic, consented, and properly separated training data.
4. Add authentication, quotas, managed credits, model policy, rate limiting, and abuse controls around Live mode.
6. Add grounded response verification and uncertainty indicators.

## Classifier foundation expansion

The local-model phase now has a stable 19-label span vocabulary and automated policy invariants. The semantic challenge set doubled from 48 to 96 cases with Nigerian English, Pidgin, Yoruba-, Hausa-, and Igbo-mixed phrasing plus harder harmless controls. The current character n-gram baseline achieves only 57.81% category recall and 78.72% measured precision on this wider set. This honest failure establishes why an on-device language model is necessary and gives candidate models a fixed gate: at least 90% recall and precision, offline execution, and no raw prompt telemetry.

## On-device candidate screening

The first candidate screen compared browser-ready multilingual BERT and DistilBERT NER exports, multilingual GLiNER, and a planned distilled Sycrely encoder. DistilBERT is the first technical benchmark because it already supports Transformers.js, but its approximately 135 MB quantized model is over the mobile target and recognizes only person, organization, location, and date entities. The approximately 1.16 GB GLiNER artifact was rejected for the web MVP despite flexible labels. The likely production path is therefore a much smaller, commercially compatible encoder fine-tuned for Sycrely's vocabulary, exported to ONNX and served as a pinned local application asset.

## Former-employer message regression

A long unpaid-salary test exposed two boundary defects. The phrases “his name is” and “the company is” did not enter the identity rules, and the interface displayed provider placeholders instead of restoring safe aliases after the response returned. Sycrely now protects third-person named identities, contextually introduced company names, exact salary amounts, Nigerian phone numbers, and an identifying job role in this scenario. Provider output is rehydrated from the alias map only in the browser. A punctuation regression test also prevents a sentence-ending full stop from becoming part of a financial alias.

## Isolated browser model laboratory

An experimental `/model-lab` page now loads the first multilingual NER candidate only after an explicit action. It accepts three fixed synthetic prompts rather than user text, caches model assets in the browser, uses the WebAssembly execution path, and displays first-load time, inference time, entity spans and confidence scores. The lab is visibly separated from Private Mode and cannot approve or send a conversation. Optional server-side ONNX and protobuf dependency build scripts remain disabled because this experiment requires only browser inference.

## Model and application security baseline

The experimental model is pinned to an immutable repository revision and a recorded SHA-256 artifact digest. Direct model tooling is exactly version-pinned. Production policy now explicitly requires self-hosting, digest verification, Worker isolation, no prompt telemetry and no cloud fallback. Route-specific security headers keep the main conversation page on same-origin browser connections while granting only the isolated lab the temporary origins needed to download its public candidate. Automated tests reject common analytics clients and unexpected browser fetch calls in the private conversation UI. A full threat model records supply-chain, runtime, application-egress and remaining operational risks.

## Same-origin model provisioning

The laboratory no longer downloads model files from Hugging Face in the user's browser. A reproducible `pnpm model:fetch` provisioning command downloads six files from one immutable revision, verifies exact sizes and SHA-256 digests, and activates them only after verification. Those large public files remain outside Git, while the repository records their manifest and fetch process. Transformers.js is configured with local models enabled, remote models disabled, and `/models/` as its only model base path. The laboratory CSP now permits same-origin connections only.

The first end-to-end browser run loaded the same-origin model in approximately 22.4 seconds and classified one synthetic sentence in approximately 964 ms on the development machine. It identified `Green Basket Media Ltd` as an organization and `Lagos` as a location with high confidence, but split the Nigerian name `Kunle Arowolo` into inconsistent subword labels. This validates the private execution path while confirming that the general multilingual NER candidate does not meet Sycrely's accuracy gate. The next model phase must train or fine-tune a smaller encoder against Sycrely's own label vocabulary and Nigerian/multilingual evaluation corpus.

## Classifier annotation pipeline

Sycrely now builds a versioned span-annotation draft from 300 Nigerian privacy examples and 200 fictional organization examples. The first reproducible build contains 500 prompts and 536 exact spans, split into 355 training, 48 validation and 97 locked test records. Group-based hashing keeps rewrites of one Nigerian template and every reuse of one fictional organization in a single split, preventing easy paraphrase leakage. Automated checks validate offsets, text equality, allowed labels, uniqueness, and split isolation. All generated labels remain explicitly marked for human review; they are not yet approved training truth.

## Local annotation review workspace

The `/annotation-lab` prototype now provides a local human-review workflow for training and validation annotations. Reviewers must identify themselves before changing data, can add, remove, and relabel exact spans, record notes and decisions, filter progress, and export an auditable JSON review file. Every action records its record ID, reviewer, timestamp, action, and detail in browser storage. The locked test split is excluded in both code and a permanent regression test. Browser verification confirmed approval counters, export readiness, persistence across reload, and a clean console. This prototype does not yet merge reviews back into training truth or support multi-reviewer adjudication.

## Full privacy-label vocabulary expansion

The reproducible corpus now contains 572 prompts and 590 exact draft spans: 403 training, 60 validation, and 109 locked test records. Seventy-two new examples close the first vocabulary gap. Fifty-four contain sensitive spans across financial accounts, payment cards, education identifiers, health details, biometric or genetic data, legal cases, employment details, identifying relationships, and identifying locations; eighteen are harmless controls that should remain untouched. Every new sensitive category has four training, one validation, and one test example, using standard English plus Nigerian Pidgin and Yoruba-, Hausa-, or Igbo-mixed phrasing. Automated tests now fail if any of the nineteen labels disappears. These remain synthetic draft annotations pending human review, not production training truth.

## Human-review approval gate

Annotation exports are now tied to the exact reviewable corpus with a deterministic fingerprint. A new local approval command validates every one of the 463 training and validation decisions, reviewer identities, labels, offsets, text matches, and overlap rules before producing approved JSONL. Missing, stale, rejected, needs-changes, or malformed reviews fail closed. The 109-record test split is structurally excluded, preventing a reviewer from tuning the training set against locked answers. No approved dataset has been generated yet because genuine human review is still required.

## Public development deployment

The complete prototype is connected to the `Larriemoses/sycrely` GitHub repository and deployed on Vercel at `https://sycrely.vercel.app`. Both the main private-conversation interface and `/annotation-lab` are available for cross-device development testing. The first Vercel build exposed a truncated generated training JSONL file from an earlier repository transfer; the intact local corpus was hash-checked, uploaded again, and the subsequent production build succeeded. Annotation review still persists in the reviewer's browser at this checkpoint, so the single trusted reviewer must export the completed review JSON for controlled approval. Shared server persistence and access-code protection remain a later enhancement if multiple reviewers or cross-device continuation become necessary.
