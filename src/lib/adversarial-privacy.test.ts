import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt } from "./privacy.ts";

type Attack = { id: string; prompt: string; category: string; hide: string; keep: string };

const attacks: Attack[] = [
  { id:"spaced-nin", prompt:"My N I N is 1234 567 8901; explain how identity verification works.", category:"government-id", hide:"1234 567 8901", keep:"identity verification" },
  { id:"dotted-nin", prompt:"N.I.N: 123-456-789-01 is in this draft; explain replacement steps.", category:"government-id", hide:"123-456-789-01", keep:"replacement steps" },
  { id:"spaced-bvn", prompt:"My B V N is 1098 765 4321; help with a bank complaint.", category:"nigeria-financial-id", hide:"1098 765 4321", keep:"bank complaint" },
  { id:"hyphen-bvn", prompt:"B-V-N: 109-876-543-21 appears in my statement dispute.", category:"nigeria-financial-id", hide:"109-876-543-21", keep:"statement dispute" },
  { id:"spaced-email", prompt:"Reply to ada.lovelace @ example . com about my medical record.", category:"email", hide:"ada.lovelace @ example . com", keep:"medical record" },
  { id:"plus-email", prompt:"My email is kemi+salary@example.ng; advise me about delayed wages.", category:"email", hide:"kemi+salary@example.ng", keep:"delayed wages" },
  { id:"title-space", prompt:"Mr . Tunde Akinbayo owes four months of salary; what evidence should I keep?", category:"identity", hide:"Tunde Akinbayo", keep:"four months of salary" },
  { id:"unicode-name", prompt:"Dr. Élodie Martin needs help understanding a prescription.", category:"identity", hide:"Élodie Martin", keep:"prescription" },
  { id:"phone-hyphens", prompt:"Call +234-803-123-4567 about my court case.", category:"phone", hide:"+234-803-123-4567", keep:"court case" },
  { id:"account-label", prompt:"Acct no. 0123456789 received the disputed salary; explain next steps.", category:"nigeria-financial-id", hide:"0123456789", keep:"disputed salary" },
  { id:"tin-hyphens", prompt:"My TIN is 12345678-0001; help explain the tax dispute.", category:"nigeria-tax-id", hide:"12345678-0001", keep:"tax dispute" },
  { id:"matric-slashes", prompt:"Student ID CSC/2024/0142 is on the disciplinary notice; help me respond.", category:"education-id", hide:"CSC/2024/0142", keep:"disciplinary notice" },
];

const benign = [
  "I wrote NIN = 42 as a variable in a toy program. Explain the assignment.",
  "My mock form has a field labelled BVN but contains no customer value.",
  "Explain what a voter identification number is in general.",
  "The number of samples in the public report is 12345678901.",
  "Show an email placeholder such as name at domain in documentation.",
  "Explain why an IPv4 address contains four numeric parts.",
  "What does RC mean in a construction drawing?",
  "A student ID card normally contains which fields?",
  "Compare NIN and BVN by purpose without using anyone's number.",
  "Explain how photosynthesis works for a secondary-school student.",
  "What is a bank account number used for?",
  "Write a fictional story about a company with no real people or records.",
];

for (const row of attacks) test(`adversarial secret: ${row.id}`, () => {
  const result = analyzePrompt(row.prompt);
  assert.equal(result.findings.some((finding) => finding.category === row.category), true);
  assert.equal(result.protectedText.toLowerCase().includes(row.hide.toLowerCase()), false);
  assert.equal(result.protectedText.toLowerCase().includes(row.keep.toLowerCase()), true);
});

for (const [index, prompt] of benign.entries()) test(`benign control: ${index + 1}`, () => {
  const result = analyzePrompt(prompt);
  assert.equal(result.findings.length, 0, `false alarm: ${result.findings.map((finding) => finding.category).join(", ")}`);
  assert.equal(result.protectedText, prompt);
});
