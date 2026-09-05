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
  "Abeg, I no wan make anybody know say I dey attend therapy for panic attacks.",
  "Mo fẹ́ ìmọ̀ràn nípa ìlera ọpọlọ mi, but keep my treatment private.",
  "Ina bukatar shawara game da magani na, kada a bayyana ko ni waye.",
  "Biko help me understand my medical result without exposing my identity.",
  "My fertility treatment and family pressure are deeply personal to me.",
  "I dey struggle with addiction recovery and I need confidential support.",
  "Please discuss my disability and medication without identifying me.",
  "My private debt and delayed wages are affecting my mental health.",
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
  "Abeg review this startup idea; the method never launch and na secret.",
  "Our unreleased fintech product uses a confidential fraud-scoring method.",
  "Mo ní business idea tuntun; please protect the unique mechanism.",
  "Wannan sabon tsarin kasuwanci sirri ne and competitors must not see it.",
  "Biko analyse our private prototype without revealing how the engine works.",
  "The customer-acquisition numbers and pricing experiment are not public.",
  "I want feedback on an unpublished research discovery before filing a patent.",
  "Keep our internal model architecture and launch sequence confidential.",
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
  "My oga threaten to sack me because I asked for three months salary.",
  "Dem accuse me wrongly after I report missing pension payments.",
  "Ọ̀gá mi ń halẹ̀ mọ́ mi since I complained about unpaid overtime.",
  "Shugabana ya yi min barazana after I reported workplace fraud.",
  "Onye isi m accused me of theft when I challenged the payroll error.",
  "How can I answer a false misconduct claim without taking revenge?",
  "HR is intimidating witnesses after we reported harassment.",
  "Help me document retaliation after a protected workplace complaint.",
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
  "I work for one named Lagos company and the complaint could identify me.",
  "My church group and political opinion together can reveal who I am.",
  "Na only me be lab technician for this clinic, so hide the affiliation.",
  "Mo jẹ́ akẹ́kọ̀ọ́ ní ilé-ẹ̀kọ́ kan and this disciplinary issue is private.",
  "Ina aiki a wani asibiti; my role and workplace must remain hidden.",
  "Abụ m onye ọrụ at a named firm and this salary dispute is sensitive.",
  "My patient relationship with a specialist centre could identify me.",
  "Protect the named union, my job title and the branch where I work.",
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
  "Explain why people may choose therapy in general.",
  "What does confidential business information mean?",
  "Translate the word retaliation into plain English.",
  "List public universities in Nigeria without discussing any student.",
  "Abeg give me a general recipe for moi moi.",
  "Explain salary negotiation without using anybody's private details.",
  "Describe how delivery companies route packages generally.",
  "Write a fictional clinic scene with completely imaginary characters.",
  "Kọ àlàyé gbogbogbò nípa bí ilé-ẹ̀kọ́ ṣe ń ṣiṣẹ́.",
  "Bayyana yadda asibiti ke aiki in general terms.",
  "Explain what a bank transfer reference is used for.",
  "Create a public launch checklist for an already announced product.",
  "Compare privacy laws at a high level without personal cases.",
  "What makes a strong password? Do not include a real password.",
  "Explain face recognition technology without processing anyone's face.",
  "Give general advice on resolving workplace disagreements peacefully.",
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
