export type PrivacyCase = {
  id: string;
  input: string;
  expectedCategories: string[];
  mustHide?: string[];
  mustKeep?: string[];
};

// Synthetic examples only. This corpus is safe to commit and is the baseline
// that a future on-device semantic model must meet or improve upon.
export const PRIVACY_CORPUS: PrivacyCase[] = [
  { id:"student-school-sensitive-research",input:"I'm Olarewaju and a student of Global College, Oke Aro. I am researching alleged fetish activities.",expectedCategories:["identity","student-of","criminal-allegation","education"],mustHide:["Olarewaju","Global College","Oke Aro"],mustKeep:["researching","fetish activities"] },
  { id:"therapy-student",input:"I'm Ada and I need therapy for what I'm facing as a student.",expectedCategories:["identity","personal-support","health","education"],mustHide:["Ada"],mustKeep:["therapy","student"] },
  { id:"workplace-complaint",input:"I work at Northstar Limited and need advice about a work complaint.",expectedCategories:["works-at","employment"],mustHide:["Northstar Limited"],mustKeep:["work complaint"] },
  { id:"hospital-affiliation",input:"I am a patient at Mercy Clinic and need help understanding my prescription.",expectedCategories:["patient-at","health"],mustHide:["Mercy Clinic"],mustKeep:["prescription"] },
  { id:"union-politics",input:"I am a member of Unity Workers Union and want to discuss my political opinion.",expectedCategories:["member-of","political"],mustHide:["Unity Workers Union"],mustKeep:["political opinion"] },
  { id:"legal-client",input:"I am a client of Adewale Chambers and need help with a court case.",expectedCategories:["client-of","legal"],mustHide:["Adewale Chambers"],mustKeep:["court case"] },
  { id:"email",input:"Contact me at ada@example.com about the report.",expectedCategories:["email"],mustHide:["ada@example.com"],mustKeep:["report"] },
  { id:"street-address",input:"Deliver it to 42 Marina Road tomorrow.",expectedCategories:["address"],mustHide:["42 Marina Road"],mustKeep:["tomorrow"] },
  { id:"network-address",input:"The private server is at 192.168.1.40.",expectedCategories:["network"],mustHide:["192.168.1.40"],mustKeep:["private server"] },
  { id:"government-id",input:"My passport number: A12345678 should be added.",expectedCategories:["government-id"],mustHide:["A12345678"] },
  { id:"banking-context",input:"Help me understand my account balance and debt plan.",expectedCategories:["financial"],mustKeep:["account balance","debt"] },
  { id:"religion-context",input:"I need advice about a disagreement involving my religious belief.",expectedCategories:["religion-belief"],mustKeep:["religious belief"] },
  { id:"family-context",input:"How should I discuss this problem with my spouse?",expectedCategories:["family"],mustKeep:["my spouse"] },
  { id:"biometric-context",input:"The login system stores a fingerprint and face scan.",expectedCategories:["biometric"],mustKeep:["fingerprint","face scan"] },
  { id:"confidential-algorithm",input:"Our confidential business idea uses a proprietary algorithm for deliveries. Create a market plan.",expectedCategories:["confidential-asset"],mustHide:["proprietary algorithm for deliveries"],mustKeep:["Create a market plan"] },
];
