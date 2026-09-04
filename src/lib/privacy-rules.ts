import type { Risk } from "./privacy.ts";

export type ContextRule = {
  id: string;
  label: string;
  severity: Risk;
  pattern: RegExp;
  handling: "preserve" | "review" | "generalize";
};

export type RelationshipRule = {
  id: string;
  label: string;
  pattern: RegExp;
  prefixGroup: number;
  valueGroup: number;
  token: "ORGANIZATION" | "LOCATION" | "PERSON";
};

// Context is flagged without automatically deleting the topic. Whether it is
// preserved or generalized is decided by the policy engine and task purpose.
export const CONTEXT_RULES: ContextRule[] = [
  { id:"health",label:"Health or medical context",severity:"high",handling:"preserve",pattern:/\b(therapy|therapist|counsell?ing|mental health|diagnos(?:is|ed)|symptoms?|medication|prescription|medical records?|medical package|test result|pregnan(?:t|cy)|disability|addiction)\b/i },
  { id:"financial",label:"Private financial context",severity:"high",handling:"preserve",pattern:/\b(bank statement|account balance|tax return|credit report|salary|salaries|income|debt|loan|mortgage|bankrupt(?:cy)?|pension|credit score|mobile money|crypto wallet)\b/i },
  { id:"legal",label:"Legal or dispute context",severity:"high",handling:"preserve",pattern:/\b(lawsuit|legal case|court case|settlement|attorney-client|solicitor-client|custody dispute|contract dispute|tribunal|arbitration)\b/i },
  { id:"criminal-allegation",label:"Criminal or misconduct allegation",severity:"high",handling:"review",pattern:/\b(accused of|alleged|allegation|crime|criminal|fraud|theft|abuse|harassment|corruption|misconduct|fetish activit(?:y|ies))\b/i },
  { id:"religion-belief",label:"Religious or philosophical belief",severity:"high",handling:"preserve",pattern:/\b(religion|religious|christian|muslim|islam|church|mosque|traditional belief|spiritual belief|atheist|philosophical belief)\b/i },
  { id:"political",label:"Political opinion or affiliation",severity:"high",handling:"preserve",pattern:/\b(political opinion|political party|party member|voting intention|campaign volunteer|activist)\b/i },
  { id:"ethnicity",label:"Race, ethnicity, or nationality context",severity:"high",handling:"preserve",pattern:/\b(race|racial|ethnic(?:ity)?|tribe|tribal|nationality)\b/i },
  { id:"sexuality",label:"Sex life or sexual-orientation context",severity:"high",handling:"preserve",pattern:/\b(sexual orientation|sex life|gay|lesbian|bisexual|transgender)\b/i },
  { id:"employment",label:"Employment or workplace context",severity:"moderate",handling:"preserve",pattern:/\b(my employer|my workplace|my CEO|our CEO|workplace|employees?|staff|salar(?:y|ies)|wages?|pay(?:s|ing|ment)? us|performance review|disciplinary hearing|job termination|work complaint|work ethic|workplace bullying|redundan(?:cy|t))\b/i },
  { id:"education",label:"Education record or student context",severity:"moderate",handling:"preserve",pattern:/\b(student|school record|exam result|academic record|disciplinary record|scholarship)\b/i },
  { id:"family",label:"Family or relationship context",severity:"moderate",handling:"preserve",pattern:/\b(my child|my parent|my spouse|my partner|my family|family matter|custody|domestic)\b/i },
  { id:"biometric",label:"Biometric or genetic context",severity:"critical",handling:"review",pattern:/\b(fingerprint|face scan|voiceprint|retina|iris scan|genetic data|dna result)\b/i },
];

// These rules capture affiliations that become identifying when combined with
// a sensitive topic: student-of, works-at, member-of, patient-at, and client-of.
export const RELATIONSHIP_RULES: RelationshipRule[] = [
  { id:"student-of",label:"Educational affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b((?:a |an )?student (?:of|at)|I (?:study|attend) at)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,5}(?:,\s*[A-Z][\w'.-]+(?:\s+[A-Z][\w'.-]+){0,3})?)/g },
  { id:"works-at",label:"Workplace affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I work at|I am employed by|[Mm]y employer is|[Aa]n employee of)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,5})/g },
  { id:"member-of",label:"Membership affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a member of|I belong to|[Mm]y union is)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,5})/g },
  { id:"patient-at",label:"Healthcare affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a patient at|[Mm]y hospital is|[Mm]y clinic is)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,5})/g },
  { id:"client-of",label:"Professional-service affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a client of|[Mm]y lawyer is|[Mm]y accountant is)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,5})/g },
];

export const CATALOG_VERSION = "2026.09.3";
