export type PrivacyHandling = "alias" | "remove" | "generalize" | "review";

export type PrivacyLabel = {
  id: string;
  title: string;
  handling: PrivacyHandling;
  contextual: boolean;
  description: string;
};

/**
 * Stable output vocabulary for deterministic detectors and future on-device
 * token-classification models. Contextual labels must not be hidden merely
 * because a word belongs to the category; the surrounding use decides.
 */
export const PRIVACY_LABELS = [
  { id: "PERSON", title: "Private person", handling: "alias", contextual: true, description: "A person whose identity is unnecessary for the external task." },
  { id: "ORGANIZATION", title: "Private organization", handling: "alias", contextual: true, description: "A workplace, school, clinic, customer, or private venture tied to the speaker." },
  { id: "ADDRESS", title: "Street or delivery address", handling: "alias", contextual: false, description: "A precise physical or postal address." },
  { id: "LOCATION", title: "Identifying location", handling: "generalize", contextual: true, description: "A location that identifies a person or private organization when combined with context." },
  { id: "PHONE", title: "Phone number", handling: "alias", contextual: false, description: "A personal, business, or recipient telephone number." },
  { id: "EMAIL", title: "Email address", handling: "alias", contextual: false, description: "An email address or deliberately obfuscated email address." },
  { id: "GOVERNMENT_ID", title: "Government identifier", handling: "remove", contextual: false, description: "Passport, NIN, BVN, voter, tax, or equivalent official identifier." },
  { id: "FINANCIAL_ACCOUNT", title: "Financial account identifier", handling: "remove", contextual: false, description: "Bank, wallet, pension, transaction, or account reference." },
  { id: "PAYMENT_CARD", title: "Payment card data", handling: "remove", contextual: false, description: "Card number, security code, or expiry data." },
  { id: "CREDENTIAL", title: "Credential or secret", handling: "remove", contextual: false, description: "Password, API key, token, signing secret, or recovery phrase." },
  { id: "NETWORK_ID", title: "Private technical endpoint", handling: "remove", contextual: true, description: "Private IP address, hostname, internal route, device identifier, or infrastructure endpoint." },
  { id: "EDUCATION_ID", title: "Education identifier", handling: "alias", contextual: false, description: "Matriculation, candidate, student, or examination identifier." },
  { id: "HEALTH_DETAIL", title: "Personal health detail", handling: "review", contextual: true, description: "A diagnosis, treatment, disability, medication, or medical result tied to someone." },
  { id: "BIOMETRIC_GENETIC", title: "Biometric or genetic data", handling: "remove", contextual: true, description: "Face, voice, fingerprint, iris, DNA, or genetic data tied to a person." },
  { id: "LEGAL_CASE", title: "Private legal or allegation detail", handling: "review", contextual: true, description: "A private case, allegation, witness, victim, or dispute detail." },
  { id: "EMPLOYMENT_DETAIL", title: "Private employment detail", handling: "review", contextual: true, description: "Salary, disciplinary, performance, payroll, or workplace information tied to a person." },
  { id: "RELATIONSHIP", title: "Identifying relationship", handling: "review", contextual: true, description: "Family, membership, patient, client, employee, or other link that can identify someone." },
  { id: "CONFIDENTIAL_ASSET", title: "Confidential idea or asset", handling: "generalize", contextual: true, description: "An unpublished invention, strategy, algorithm, research result, or trade secret." },
  { id: "FINANCIAL_AMOUNT", title: "Exact private amount", handling: "alias", contextual: true, description: "An exact balance, salary, payment, debt, price, or transfer amount in a private matter." },
] as const satisfies readonly PrivacyLabel[];

export type PrivacyLabelId = (typeof PRIVACY_LABELS)[number]["id"];

