import test from "node:test";
import assert from "node:assert/strict";
import { analyzePrompt, restoreAliases } from "./privacy.ts";

test("removes credentials and marks critical risk", () => {
  const result = analyzePrompt("My API key: sk-example-secret-123456789");
  assert.equal(result.risk, "critical");
  assert.equal(result.protectedText.includes("sk-example"), false);
});

test("generalizes a confidential business idea, not only its owner", () => {
  const result = analyzePrompt("My confidential product idea is a battery using a secret graphite mechanism. Help me assess the launch strategy.");
  assert.equal(result.risk, "high");
  assert.equal(result.contentPolicy, "confidential-asset");
  assert.match(result.protectedText, /\[CONFIDENTIAL_ASSET_1\]/);
  assert.doesNotMatch(result.protectedText, /graphite mechanism/i);
  assert.match(result.protectedText, /Help me assess the launch strategy/i);
});

test("protects identity but preserves necessary therapy context", () => {
  const result = analyzePrompt("I'm Olarewaju and I need therapy. I need advice on what I'm facing as a student.");
  assert.equal(result.risk, "high");
  assert.equal(result.contentPolicy, "identity-only");
  assert.match(result.protectedText, /I'm \[PERSON_1\] and I need therapy/i);
  assert.match(result.protectedText, /what I'm facing as a student/i);
  assert.doesNotMatch(result.protectedText, /Olarewaju/);
  assert.equal(result.aliases.some((alias) => alias.value === "Olarewaju"), true);
});

test("redacts a named identity without consuming nearby words", () => {
  const result = analyzePrompt("My name is Ada Lovelace and I need general advice.");
  assert.match(result.protectedText, /my name is \[PERSON_1\] and/i);
  assert.doesNotMatch(result.protectedText, /Ada Lovelace/);
});

test("leaves a public question usable", () => {
  const result = analyzePrompt("Explain how photosynthesis works");
  assert.equal(result.risk, "low");
  assert.equal(result.protectedText, "Explain how photosynthesis works");
  assert.equal(result.contentPolicy, "standard");
});

test("removes organization, address, and network identifiers", () => {
  const result = analyzePrompt("My company is Green Rocket at 42 Marina Road using 192.168.10.42");
  assert.equal(result.risk, "high");
  assert.match(result.protectedText, /\[ORGANIZATION_1\]/);
  assert.match(result.protectedText, /\[ADDRESS_1\]/);
  assert.match(result.protectedText, /\[IP_ADDRESS_1\]/);
});

test("flags sensitive meaning even without a direct identifier", () => {
  const result = analyzePrompt("Help me understand my medical record and test result");
  assert.equal(result.risk, "high");
  assert.equal(result.findings.some((finding) => finding.category === "health"), true);
});

test("protects an executive, owned company, and company location in a workplace complaint", () => {
  const result = analyzePrompt("My CEO mr. Olaniyi owns Greyish Chamber. The company which is located in Ikorodu, Lagos does not pay our salaries on time.");
  assert.doesNotMatch(result.protectedText, /Olaniyi|Greyish Chamber|Ikorodu|Lagos/);
  assert.match(result.protectedText, /mr\. \[PERSON_1\]/i);
  assert.match(result.protectedText, /owns \[ORGANIZATION_1\]/);
  assert.match(result.protectedText, /located in \[LOCATION_1\]/i);
  assert.match(result.protectedText, /salaries on time/i);
  assert.equal(result.findings.some((finding) => finding.category === "employment"), true);
});

test("detects when individually ordinary details become identifying together", () => {
  const result = analyzePrompt("I'm a 37 year old accountant living in Ikorodu. I work at CedarPeak Ventures and need advice about a private salary dispute.");
  assert.equal(result.combinationRisk.level, "high");
  assert.ok(result.combinationRisk.score >= 5);
  assert.equal(result.combinationRisk.signals.includes("Exact age"), true);
  assert.equal(result.combinationRisk.signals.includes("Specific occupation"), true);
  assert.equal(result.findings.some((finding) => finding.category === "combination-risk"), true);
});

test("does not flag an ordinary public question as a combination risk", () => {
  const result = analyzePrompt("Explain how photosynthesis works for a student");
  assert.equal(result.combinationRisk.level, "none");
  assert.equal(result.findings.some((finding) => finding.category === "combination-risk"), false);
});

test("protects every direct identifier in a Nigerian landlord-payment request", () => {
  const input = "Help me write a message to my landlord. My name is Daniel Eze, I stay at 14 Test Crescent, Ikeja, and my number is 0800-555-0172. I already sent him ₦300,000 from account TEST-88219 last week but he said he hasn't seen it.";
  const result = analyzePrompt(input);
  assert.doesNotMatch(result.protectedText, /Daniel Eze|14 Test Crescent|Ikeja|0800-555-0172|TEST-88219/);
  assert.match(result.protectedText, /\[PERSON_1\]/);
  assert.match(result.protectedText, /\[ADDRESS_1\]/);
  assert.match(result.protectedText, /\[PHONE_1\]/);
  assert.match(result.protectedText, /\[FINANCIAL_IDENTIFIER_REMOVED\]/);
  assert.equal(result.risk, "critical");
});

test("protects customer delivery identity, phone, address, and naira amounts", () => {
  const input = "I want to send this customer’s details to my delivery guy: Ada Nnamdi, 24 Palm Crescent, Ikeja, 0800-555-0181. She ordered two laptops worth ₦1.4 million and already paid ₦900,000. Write a short message for me.";
  const result = analyzePrompt(input);
  assert.doesNotMatch(result.protectedText, /Ada Nnamdi|24 Palm Crescent|Ikeja|0800-555-0181|₦1\.4 million|₦900,000/);
  assert.match(result.protectedText, /\[PERSON_1\]/);
  assert.match(result.protectedText, /\[ADDRESS_1\]/);
  assert.match(result.protectedText, /\[PHONE_1\]/);
  assert.match(result.protectedText, /\[FINANCIAL_AMOUNT_1\]/);
  assert.match(result.protectedText, /\[FINANCIAL_AMOUNT_2\]/);
  assert.match(result.protectedText, /two laptops/);
  assert.match(result.protectedText, /Write a short message/);
});

test("protects a former boss, company, role, phone and salary amounts", () => {
  const prompt = "I need help writing a message to my former boss because he still hasn’t paid me for almost four months. His name is Kunle Arowolo and the company is Green Basket Media Ltd. I was working there as a content manager and my salary was ₦280,000 every month. He currently owes me ₦1,120,000. I’ve called him several times on 0800-555-0138 but now he barely responds. The annoying part is that I know two other staff are also being owed. I have screenshots of our conversations and the transfers they made when they used to pay us. Please write something serious I can send him tonight because I’m tired of hearing ‘next week’ every time.";
  const result = analyzePrompt(prompt);
  assert.doesNotMatch(result.protectedText, /Kunle Arowolo|Green Basket Media Ltd|content manager|₦280,000|₦1,120,000|0800-555-0138/i);
  assert.match(result.protectedText, /\[PERSON_1\]/);
  assert.match(result.protectedText, /\[ORGANIZATION_1\]/);
  assert.match(result.protectedText, /\[JOB_ROLE_1\]/);
  assert.match(result.protectedText, /\[FINANCIAL_AMOUNT_1\]/);
  assert.match(result.protectedText, /\[FINANCIAL_AMOUNT_2\]/);
  assert.match(result.protectedText, /\[PHONE_1\]/);
  assert.match(result.protectedText, /almost four months|screenshots|Please write something serious/i);
});

test("restores provider placeholders only after the answer returns locally", () => {
  const result = analyzePrompt("His name is Kunle Arowolo and my salary was ₦280,000.");
  const providerAnswer = "Send [PERSON_1] a request for [FINANCIAL_AMOUNT_1].";
  assert.equal(restoreAliases(providerAnswer, result.aliases), "Send Kunle Arowolo a request for ₦280,000.");
});
