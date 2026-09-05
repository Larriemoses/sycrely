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
  { id:"health",label:"Health or medical context",severity:"high",handling:"preserve",pattern:/\b(therapy|therapist|counsell?ing|mental health|anxiety|panic attacks?|diagnos(?:is|ed)|symptoms?|medication|prescription|medical records?|medical package|test result|pregnan(?:t|cy)|prenatal|fertility|IVF|migraine|asthma|hypertension|blood pressure|hearing impairment|disability|addiction|alcohol dependence|inherited condition|genetic counselling)\b/i },
  { id:"financial",label:"Private financial context",severity:"high",handling:"preserve",pattern:/\b(bank statement|account balance|tax return|credit report|salary|salaries|payroll|income|rent|debt|owes?|loans?|mortgage|bankrupt(?:cy)?|pension|credit score|mobile money|transfer dispute|crypto wallet)\b/i },
  { id:"legal",label:"Legal or dispute context",severity:"high",handling:"preserve",pattern:/\b(lawsuit|legal case|court case|court hearing|case documents?|settlement|attorney-client|solicitor-client|custody dispute|contract dispute|tenancy dispute|mediation|tribunal|arbitration|labour rights|preserve (?:workplace )?evidence)\b/i },
  { id:"criminal-allegation",label:"Criminal or misconduct allegation",severity:"high",handling:"review",pattern:/\b(accused(?:\s+internally)? of|alleged|alleges?|allegation|crime|criminal|fraud|theft|stealing|assault|abuse|harassment|corruption|misconduct|diverting|sexual comments|hitting them|fetish activit(?:y|ies))\b/i },
  { id:"religion-belief",label:"Religious or philosophical belief",severity:"high",handling:"preserve",pattern:/\b(religion|religious|christian|muslim|islam|church|mosque|fellowship|assembly|fasting practice|traditional belief|spiritual belief|atheist|philosophical belief)\b/i },
  { id:"political",label:"Political opinion or affiliation",severity:"high",handling:"preserve",pattern:/\b(political opinion|political arguments?|political party|party member|voting intention|campaign volunteer|civic movement|strongly oppose|activist)\b/i },
  { id:"ethnicity",label:"Race, ethnicity, or nationality context",severity:"high",handling:"preserve",pattern:/\b(race|racial|ethnic(?:ity)?|tribe|tribal|nationality)\b/i },
  { id:"sexuality",label:"Sex life or sexual-orientation context",severity:"high",handling:"preserve",pattern:/\b(sexual orientation|sex life|gay|lesbian|bisexual|transgender)\b/i },
  { id:"employment",label:"Employment or workplace context",severity:"moderate",handling:"preserve",pattern:/\b(my employer|her employer|their employer|my workplace|my CEO|our CEO|workplace|employees?|staff|director|supervisor|payroll|HR|work rota|labour rights|shifts?|CV|procurement analyst|CPD|salar(?:y|ies)|wages?|pay(?:s|ing|ment)? us|performance review|disciplinary hearing|job termination|work complaint|work ethic|workplace bullying|redundan(?:cy|t))\b/i },
  { id:"education",label:"Education record or student context",severity:"moderate",handling:"preserve",pattern:/\b(student|enrolled|stud(?:y|ies|ied)|school record|exam|revision plan|academic record|disciplinary (?:record|warning)|scholarship|plagiarism|GPA|carryovers?|research method)\b/i },
  { id:"family",label:"Family or relationship context",severity:"moderate",handling:"preserve",pattern:/\b(my child|our child|my parent|my spouse|my partner|their partner|former partner|my family|family member|family test|family matter|siblings?|twin daughters|fertility|IVF|pregnant|custody|co-parenting|domestic)\b/i },
  { id:"biometric",label:"Biometric or genetic context",severity:"critical",handling:"review",pattern:/\b(fingerprint|fingerprint-template|face scan|face embed|voiceprint|retina|iris scan|genetic data|genetic counselling|genetic marker|marker pattern|dna result)\b/i },
  { id:"ambiguous-retaliation",label:"Ambiguous retaliation wording",severity:"high",handling:"review",pattern:/\b(pay\b.{0,60}\bback|get even|teach (?:him|her|them) a lesson|take revenge|retaliate)\b/i },
];

// These rules capture affiliations that become identifying when combined with
// a sensitive topic: student-of, works-at, member-of, patient-at, and client-of.
export const RELATIONSHIP_RULES: RelationshipRule[] = [
  { id:"student-of",label:"Educational affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b((?:a |an )?student (?:of|at)|I (?:study|attend) at|I am enrolled at|stud(?:y|ies)(?:\s+\w+)? at|a student at)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,6}(?:\s+\(fictional\))?(?:,\s*[A-Z][\w'.-]+(?:\s+[A-Z][\w'.-]+){0,3})?)/g },
  { id:"works-at",label:"Workplace affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I work at|I am employed by|[Mm]y employer is|[Mm]y employer|[Aa]n employee of|works at|payroll officer at)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,6}(?:\s+\(fictional\))?)/g },
  { id:"member-of",label:"Membership affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a member of|I belong to|[Mm]y union is|is a member of|quietly joined|belongs to|privately belongs to)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,8}(?:\s+\(fictional\))?)/g },
  { id:"patient-at",label:"Healthcare affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a patient at|[Mm]y hospital is|[Mm]y clinic is|was treated at|is receiving (?:IVF|medical|fertility) care at)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,7}(?:\s+\(fictional\))?)/g },
  { id:"client-of",label:"Professional-service affiliation",token:"ORGANIZATION",prefixGroup:1,valueGroup:2,pattern:/\b(I am a client of|[Mm]y lawyer is|[Mm]y accountant is|is privately a client of|is a client of)\s+([A-Z][\w&'.-]+(?:\s+[A-Z][\w&'.-]+){0,8}(?:\s+\(fictional\))?)/g },
];

export const CATALOG_VERSION = "2026.09.4";
