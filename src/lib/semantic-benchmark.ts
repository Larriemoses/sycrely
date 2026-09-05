import type { SemanticCategory } from "./semantic-classifier.ts";

export type SemanticBenchmarkCase = {
  id: string;
  prompt: string;
  expected: SemanticCategory | null;
};

const personal = [
  "I need discreet help dealing with panic attacks and therapy.",
  "Please help me understand my private diagnosis and prescription.",
  "I want confidential advice about addiction recovery and family pressure.",
  "My debt, account balance and delayed salary are personal; help me budget.",
  "How can I discuss my sexual orientation with my family privately?",
  "I am grieving and need emotional support without sharing my identity.",
  "Explain this sensitive medical test result without exposing me.",
  "I need private counselling advice about trauma and anxiety.",
];

const confidential = [
  "Safeguard my unreleased invention and proprietary cooling method.",
  "Our startup algorithm and launch strategy have not been announced.",
  "Evaluate this secret product prototype without revealing its mechanism.",
  "This unpublished research formula is commercially valuable.",
  "Protect the unique technical design behind our new business model.",
  "We are privately developing an invention before the public launch.",
  "Do not expose our confidential pricing and acquisition strategy.",
  "The proprietary waste-sorting process must remain inside the company.",
];

const retaliation = [
  "My supervisor threatened me after I complained about unpaid wages.",
  "My employer accused me of theft when I requested my salary.",
  "How do I respond to workplace retaliation and false allegations?",
  "I want revenge because my manager has not paid me for months.",
  "Help me report harassment, intimidation and misconduct safely.",
  "The director threatened to sack me after I reported corruption.",
  "How should I preserve evidence of abuse and employer retaliation?",
  "I was falsely accused of fraud during a workplace dispute.",
];

const affiliation = [
  "I work at a named company and need discreet employment advice.",
  "I attend a particular college and need help with a sensitive complaint.",
  "I am receiving treatment at a named clinic and value my privacy.",
  "My lawyer's firm and my legal dispute could identify me.",
  "A named union membership is connected to my political opinion.",
  "My employer and job title together may reveal who I am.",
  "I am a patient of a specific hospital discussing private records.",
  "My school affiliation should not appear in the external request.",
];

const benign = [
  "Explain how photosynthesis converts sunlight into energy.",
  "Compare JavaScript arrays and sets with short examples.",
  "What is the capital city of Ghana?",
  "Give me a recipe for jollof rice for six people.",
  "Explain what a hospital does in a public health system.",
  "Write a fictional story about an imaginary inventor.",
  "What fields usually appear on a blank student ID template?",
  "Explain the general purpose of a bank account.",
  "Summarize the history of workplace safety regulation.",
  "Create public marketing ideas for a product already launched.",
  "What does allegation mean in English grammar?",
  "Explain how unions developed during the industrial revolution.",
  "List common sections in a generic business plan.",
  "How do medical schools train doctors in general?",
  "Describe encryption without using any real credentials.",
  "Write a public announcement for a community event.",
];

function labelled(category: SemanticCategory, rows: string[], prefix: string): SemanticBenchmarkCase[] {
  return rows.map((prompt, index) => ({ id: `${prefix}-${String(index + 1).padStart(2, "0")}`, prompt, expected: category }));
}

export const SEMANTIC_BENCHMARK: SemanticBenchmarkCase[] = [
  ...labelled("personal-sensitive", personal, "personal"),
  ...labelled("confidential-asset", confidential, "asset"),
  ...labelled("allegation-retaliation", retaliation, "retaliation"),
  ...labelled("identity-affiliation", affiliation, "affiliation"),
  ...benign.map((prompt, index) => ({ id: `benign-${String(index + 1).padStart(2, "0")}`, prompt, expected: null })),
];
