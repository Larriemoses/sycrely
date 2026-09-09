import { groupForSplit, type TrainingRecord, type TrainingSplit } from "./training-corpus.ts";
import type { PrivacyLabelId } from "./privacy-labels.ts";

type ExpansionExample = { text: string; value?: string; style: string };
const distribution: TrainingSplit[] = ["train","train","train","train","validation","test"];

const examples: Record<PrivacyLabelId,ExpansionExample[]> = {
  FINANCIAL_ACCOUNT: [
    {text:"Please explain how to dispute a debit linked to account ACCT-FICT-820041 without exposing the account reference.",value:"ACCT-FICT-820041",style:"standard-english"},
    {text:"Abeg help check the transfer issue, my wallet ID is WALLET-DEMO-NG-7721.",value:"WALLET-DEMO-NG-7721",style:"pidgin"},
    {text:"The pension complaint mentions RSA-FICT-440029; draft a neutral escalation.",value:"RSA-FICT-440029",style:"standard-english"},
    {text:"Biko, transaction reference TXN-DEMO-9917-AB was charged twice; how do I complain?",value:"TXN-DEMO-9917-AB",style:"igbo-mix"},
    {text:"Jowo protect beneficiary account 0011223344 while keeping the failed-payment question useful.",value:"0011223344",style:"yoruba-mix"},
    {text:"Don Allah, hide mobile-money wallet MM-FICT-778899 before drafting the support message.",value:"MM-FICT-778899",style:"hausa-mix"},
  ],
  PAYMENT_CARD: [
    {text:"Remove card number 4111 1111 1111 1111 before explaining the declined purchase.",value:"4111 1111 1111 1111",style:"standard-english"},
    {text:"Abeg hide 5555-5555-5555-4444 from this chargeback question.",value:"5555-5555-5555-4444",style:"pidgin"},
    {text:"The test card ends with full value 4000000000000002; redact it and keep the fraud advice.",value:"4000000000000002",style:"standard-english"},
    {text:"Biko remove CVV 731 from the payment-support draft.",value:"CVV 731",style:"igbo-mix"},
    {text:"Jowo protect expiry 09/31 and card details before rewriting this merchant complaint.",value:"expiry 09/31",style:"yoruba-mix"},
    {text:"Don Allah hide virtual card VCARD-FICT-90210 from the reimbursement request.",value:"VCARD-FICT-90210",style:"hausa-mix"},
  ],
  EDUCATION_ID: [
    {text:"My matriculation number MAT-FICT-2026-0041 appears in the appeal; please remove it.",value:"MAT-FICT-2026-0041",style:"standard-english"},
    {text:"Abeg hide JAMB-FICT-772201 before helping with admission advice.",value:"JAMB-FICT-772201",style:"pidgin"},
    {text:"The exam complaint includes candidate ID CAND-DEMO-88104; draft it safely.",value:"CAND-DEMO-88104",style:"standard-english"},
    {text:"Biko protect student number STU-FICT-19-4407 in this scholarship request.",value:"STU-FICT-19-4407",style:"igbo-mix"},
    {text:"Jowo remove WAEC-DEMO-2026-1882 while keeping the result-checking steps.",value:"WAEC-DEMO-2026-1882",style:"yoruba-mix"},
    {text:"Don Allah hide registration code REG-FICT-KD-9301 from the school email.",value:"REG-FICT-KD-9301",style:"hausa-mix"},
  ],
  HEALTH_DETAIL: [
    {text:"My private diagnosis is relapsing-remitting multiple sclerosis; help me prepare general workplace questions.",value:"relapsing-remitting multiple sclerosis",style:"standard-english"},
    {text:"Abeg protect that I take sertraline 50 mg daily, but keep the medication-discussion advice.",value:"sertraline 50 mg daily",style:"pidgin"},
    {text:"A laboratory note says HbA1c result 9.2%; explain what questions a patient could ask.",value:"HbA1c result 9.2%",style:"standard-english"},
    {text:"Biko hide the detail: twelve weeks pregnant, while preserving appointment guidance.",value:"twelve weeks pregnant",style:"igbo-mix"},
    {text:"Jowo protect the phrase panic attacks every Tuesday before drafting a support request.",value:"panic attacks every Tuesday",style:"yoruba-mix"},
    {text:"Don Allah keep chronic kidney disease stage 3 private and give general clinic questions.",value:"chronic kidney disease stage 3",style:"hausa-mix"},
  ],
  BIOMETRIC_GENETIC: [
    {text:"The pilot stored fingerprint template FPT-DEMO-4401; write a deletion request.",value:"fingerprint template FPT-DEMO-4401",style:"standard-english"},
    {text:"Abeg remove face embedding FACE-FICT-778 before discussing retention policy.",value:"face embedding FACE-FICT-778",style:"pidgin"},
    {text:"The access log contains voiceprint VP-DEMO-9012; draft an incident question safely.",value:"voiceprint VP-DEMO-9012",style:"standard-english"},
    {text:"Biko protect DNA marker BRCA-DEMO-AA17 and keep the counselling topic.",value:"DNA marker BRCA-DEMO-AA17",style:"igbo-mix"},
    {text:"Jowo hide iris scan identifier IRIS-FICT-5548 in the complaint.",value:"iris scan identifier IRIS-FICT-5548",style:"yoruba-mix"},
    {text:"Don Allah remove genetic profile GENE-DEMO-CT-TT before summarising the consent issue.",value:"genetic profile GENE-DEMO-CT-TT",style:"hausa-mix"},
  ],
  LEGAL_CASE: [
    {text:"Keep private that I am the witness in tenancy case FICT-LT-2026-44; give general preparation advice.",value:"witness in tenancy case FICT-LT-2026-44",style:"standard-english"},
    {text:"Abeg hide the allegation that I diverted cooperative funds while drafting neutral wording.",value:"allegation that I diverted cooperative funds",style:"pidgin"},
    {text:"The confidential settlement offer is NGN 4.2 million; explain general negotiation questions.",value:"confidential settlement offer is NGN 4.2 million",style:"standard-english"},
    {text:"Biko protect victim statement reference VS-FICT-2281 before organising the documents.",value:"victim statement reference VS-FICT-2281",style:"igbo-mix"},
    {text:"Jowo hide that my custody hearing is on 18 October at Courtroom 7, but keep preparation advice.",value:"custody hearing is on 18 October at Courtroom 7",style:"yoruba-mix"},
    {text:"Don Allah protect whistleblower allegation file WB-DEMO-9008 in this counsel summary.",value:"whistleblower allegation file WB-DEMO-9008",style:"hausa-mix"},
  ],
  EMPLOYMENT_DETAIL: [
    {text:"My performance review says needs improvement in leadership; help me prepare a response.",value:"performance review says needs improvement in leadership",style:"standard-english"},
    {text:"Abeg hide that my monthly salary is NGN 380,000 while keeping budgeting advice.",value:"monthly salary is NGN 380,000",style:"pidgin"},
    {text:"The private disciplinary warning alleges repeated lateness; draft a professional reply.",value:"disciplinary warning alleges repeated lateness",style:"standard-english"},
    {text:"Biko protect payroll grade GL-FICT-08 and give general promotion questions.",value:"payroll grade GL-FICT-08",style:"igbo-mix"},
    {text:"Jowo hide redundancy selection score 42/100 before reviewing the appeal structure.",value:"redundancy selection score 42/100",style:"yoruba-mix"},
    {text:"Don Allah keep my unpaid overtime total of 73 hours private while drafting a complaint.",value:"unpaid overtime total of 73 hours",style:"hausa-mix"},
  ],
  RELATIONSHIP: [
    {text:"Keep private that she is my therapist and former lecturer; advise on setting boundaries generally.",value:"my therapist and former lecturer",style:"standard-english"},
    {text:"Abeg hide that the complainant is my younger brother before writing neutral advice.",value:"complainant is my younger brother",style:"pidgin"},
    {text:"The report identifies him as a confidential legal client; explain record-handling principles.",value:"confidential legal client",style:"standard-english"},
    {text:"Biko protect that she is my employee and tenant while keeping conflict-of-interest guidance.",value:"my employee and tenant",style:"igbo-mix"},
    {text:"Jowo hide that I am a member of the internal opposition caucus; discuss workplace speech generally.",value:"member of the internal opposition caucus",style:"yoruba-mix"},
    {text:"Don Allah protect that the patient is my spouse before explaining consent questions.",value:"patient is my spouse",style:"hausa-mix"},
  ],
  LOCATION: [
    {text:"My private workplace is in the only pharmacy beside Kofar Wambai Market; generalise the location.",value:"the only pharmacy beside Kofar Wambai Market",style:"standard-english"},
    {text:"Abeg hide that I live inside Cedar Estate, Block C before giving safety advice.",value:"inside Cedar Estate, Block C",style:"pidgin"},
    {text:"The clinic visit happens in Ward 4 of the small facility near Oja-Oba; protect that location.",value:"Ward 4 of the small facility near Oja-Oba",style:"standard-english"},
    {text:"Biko generalise my village, Umu-Fiction near the eastern border, but keep travel advice.",value:"Umu-Fiction near the eastern border",style:"igbo-mix"},
    {text:"Jowo protect the fact that our office is upstairs above Demo Junction bus stop.",value:"upstairs above Demo Junction bus stop",style:"yoruba-mix"},
    {text:"Don Allah hide my regular location at Stall 17, Fiction Central Market before drafting the message.",value:"Stall 17, Fiction Central Market",style:"hausa-mix"},
  ],
  PERSON: [], ORGANIZATION: [], ADDRESS: [], PHONE: [], EMAIL: [], GOVERNMENT_ID: [], CREDENTIAL: [], NETWORK_ID: [], CONFIDENTIAL_ASSET: [], FINANCIAL_AMOUNT: [],
};

const targetLabels = Object.entries(examples).filter(([,rows]) => rows.length) as [PrivacyLabelId,ExpansionExample[]][];
export const PRIVACY_LABEL_EXPANSION: TrainingRecord[] = targetLabels.flatMap(([label,rows]) => rows.map((row,index)=>{
  const split=distribution[index];const sourceGroup=groupForSplit(`expansion:${label}:${index+1}`,split);
  const start=row.text.indexOf(row.value!);if(start<0)throw new Error(`Missing expansion value for ${label}`);
  return {id:`exp-${label.toLocaleLowerCase().replaceAll("_","-")}-${index+1}`,text:row.text,languageStyle:row.style,source:"privacy-label-expansion",sourceGroup,split,spans:[{start,end:start+row.value!.length,text:row.value!,label}],reviewStatus:"machine-derived-needs-human-review"};
}));

const controls = [
  "Explain what a bank account is without using anybody's real details.","Show a fictional card layout using X characters only.","What is a university matriculation ceremony?","Give general information about healthy sleep.","How does fingerprint recognition work in theory?","Explain the difference between civil and criminal law.","What belongs in a general employee handbook?","Define a professional client relationship.","Why do maps use latitude and longitude?",
  "Abeg explain compound interest with round numbers.","Biko describe how school examinations are graded generally.","Jowo give general questions to ask a doctor.","Don Allah explain what DNA means in biology.","Write a fictional courtroom scene with no real case.","Explain why teams conduct performance reviews.","Describe healthy boundaries in friendships.","What makes a city densely populated?","Explain why online shops use test card numbers.",
];
export const PRIVACY_LABEL_CONTROLS: TrainingRecord[] = controls.map((text,index)=>{const split=distribution[index%distribution.length];const sourceGroup=groupForSplit(`expansion:control:${index+1}`,split);return{id:`exp-control-${index+1}`,text,languageStyle:["standard-english","pidgin","igbo-mix","yoruba-mix","hausa-mix"][index%5],source:"privacy-label-expansion",sourceGroup,split,spans:[],reviewStatus:"machine-derived-needs-human-review"};});
