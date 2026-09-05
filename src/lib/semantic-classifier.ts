export type SemanticCategory = "personal-sensitive" | "confidential-asset" | "allegation-retaliation" | "identity-affiliation";

export type SemanticPrediction = {
  category: SemanticCategory;
  confidence: number;
  matchedExample: string;
};

export type SemanticClassification = {
  engine: "local-character-ngram-baseline";
  version: "0.1.0";
  predictions: SemanticPrediction[];
  durationMs: number;
};

const examples: Record<SemanticCategory, string[]> = {
  "personal-sensitive": [
    "I need private advice about my mental health and therapy",
    "help me understand a diagnosis medication or medical record",
    "I am discussing sexuality religion family trauma or addiction",
    "my financial debt salary pension or account dispute is private",
  ],
  "confidential-asset": [
    "this is an unpublished product idea with a secret mechanism",
    "our confidential startup strategy algorithm prototype and launch plan",
    "protect the proprietary research formula invention or business model",
    "the unreleased technical design must not reach another company",
  ],
  "allegation-retaliation": [
    "my employer accused threatened harassed or retaliated against me",
    "how do I pay my manager back or get revenge for unpaid salary",
    "I need to report fraud theft abuse corruption or misconduct",
    "a workplace dispute involves threats and false allegations",
  ],
  "identity-affiliation": [
    "I work at a named company and need private workplace advice",
    "I am a student at a named school discussing a sensitive matter",
    "I am a patient at a hospital or client of a lawyer",
    "a named person belongs to an organization union clinic or employer",
  ],
};

function normalize(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function ngrams(value: string, size = 3) {
  const compact = normalize(value);
  const grams = new Set<string>();
  for (let index = 0; index <= compact.length - size; index += 1) grams.add(compact.slice(index, index + size));
  return grams;
}

function dice(left: Set<string>, right: Set<string>) {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const item of left) if (right.has(item)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}

const prepared = Object.fromEntries(Object.entries(examples).map(([category, rows]) => [
  category,
  rows.map((text) => ({ text, grams: ngrams(text) })),
])) as Record<SemanticCategory, Array<{ text: string; grams: Set<string> }>>;

export function classifySemanticContext(input: string): SemanticClassification {
  const started = performance.now();
  const inputGrams = ngrams(input);
  const predictions = (Object.keys(prepared) as SemanticCategory[]).map((category) => {
    const matches = prepared[category].map((row) => ({ matchedExample: row.text, confidence: dice(inputGrams, row.grams) }));
    const best = matches.sort((a, b) => b.confidence - a.confidence)[0];
    return { category, confidence: Number(best.confidence.toFixed(3)), matchedExample: best.matchedExample };
  }).filter((prediction) => prediction.confidence >= 0.18).sort((a, b) => b.confidence - a.confidence);
  return { engine: "local-character-ngram-baseline", version: "0.1.0", predictions, durationMs: Number((performance.now() - started).toFixed(2)) };
}
