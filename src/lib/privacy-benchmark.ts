import { PRIVACY_CORPUS, type PrivacyCase } from "./privacy-corpus.ts";

// Additional synthetic prompts broaden the baseline to exactly 100 cases.
// They contain invented people and organizations only; no real user data.
const INTERNATIONAL_CASES: PrivacyCase[] = [
  {id:"title-nigeria-chief",input:"Chief Adekunle needs advice about delayed wages.",expectedCategories:["identity","employment"],mustHide:["Adekunle"],mustKeep:["delayed wages"]},
  {id:"title-nigeria-barrister",input:"Barrister Chiamaka shared details of a legal case.",expectedCategories:["identity","legal"],mustHide:["Chiamaka"],mustKeep:["legal case"]},
  {id:"title-france",input:"Dr. Élodie Martin needs help explaining a diagnosis.",expectedCategories:["identity","health"],mustHide:["Élodie Martin"],mustKeep:["diagnosis"]},
  {id:"title-spain",input:"Prof. José García is mentioned in a misconduct allegation.",expectedCategories:["identity","criminal-allegation"],mustHide:["José García"],mustKeep:["misconduct allegation"]},
  {id:"title-poland",input:"Ms. Łucja Kowalska sent a medical record for explanation.",expectedCategories:["identity","health"],mustHide:["Łucja Kowalska"],mustKeep:["medical record"]},
  {id:"title-ireland",input:"Mr. O’Connor wants guidance about a debt plan.",expectedCategories:["identity","financial"],mustHide:["O’Connor"],mustKeep:["debt plan"]},
  {id:"title-engineer",input:"Engr. Tunde Balogun reported workplace bullying.",expectedCategories:["identity","employment"],mustHide:["Tunde Balogun"],mustKeep:["workplace bullying"]},
  {id:"title-pastor",input:"Pastor Ngozi Okafor wants to discuss a religious belief.",expectedCategories:["identity","religion-belief"],mustHide:["Ngozi Okafor"],mustKeep:["religious belief"]},
  {id:"title-imam",input:"Imam Musa Abdullahi needs advice about a family matter.",expectedCategories:["identity","family"],mustHide:["Musa Abdullahi"],mustKeep:["family"]},
  {id:"title-india",input:"Dr Priya Sharma wants help understanding a prescription.",expectedCategories:["identity","health"],mustHide:["Priya Sharma"],mustKeep:["prescription"]},

  {id:"school-lagos",input:"I am a student of Lagoon Technical College, Lagos and need scholarship advice.",expectedCategories:["student-of","education"],mustHide:["Lagoon Technical College","Lagos"],mustKeep:["scholarship"]},
  {id:"school-accra",input:"I study at Sunrise Academy and need help with an exam result.",expectedCategories:["student-of","education"],mustHide:["Sunrise Academy"],mustKeep:["exam result"]},
  {id:"school-nairobi",input:"I attend at Horizon University and want to challenge a disciplinary record.",expectedCategories:["student-of","education"],mustHide:["Horizon University"],mustKeep:["disciplinary record"]},
  {id:"school-london",input:"A student at Westbridge College needs counselling.",expectedCategories:["student-of","personal-support","health","education"],mustHide:["Westbridge College"],mustKeep:["counselling"]},
  {id:"school-delhi",input:"I am a student at Lotus Institute and need academic record guidance.",expectedCategories:["student-of","education"],mustHide:["Lotus Institute"],mustKeep:["academic record"]},
  {id:"school-toronto",input:"I attend at Northern Arts School and need scholarship guidance.",expectedCategories:["student-of","education"],mustHide:["Northern Arts School"],mustKeep:["scholarship"]},
  {id:"school-dubai",input:"I study at Crescent Business Academy and need exam result advice.",expectedCategories:["student-of","education"],mustHide:["Crescent Business Academy"],mustKeep:["exam result"]},
  {id:"school-brazil",input:"A student of Atlantic Language College needs help with a school record.",expectedCategories:["student-of","education"],mustHide:["Atlantic Language College"],mustKeep:["school record"]},

  {id:"work-nigeria",input:"I work at Amber Foods Limited and need advice about delayed salary.",expectedCategories:["works-at","employment","financial"],mustHide:["Amber Foods Limited"],mustKeep:["delayed salary"]},
  {id:"work-ghana",input:"I am employed by Gold Coast Analytics and face workplace bullying.",expectedCategories:["works-at","employment"],mustHide:["Gold Coast Analytics"],mustKeep:["workplace bullying"]},
  {id:"work-kenya",input:"My employer is Savannah Digital Group and my wages are late.",expectedCategories:["works-at","employment"],mustHide:["Savannah Digital Group"],mustKeep:["wages"]},
  {id:"work-uk",input:"An employee of North Bridge Media needs redundancy advice.",expectedCategories:["works-at","employment"],mustHide:["North Bridge Media"],mustKeep:["redundancy"]},
  {id:"work-canada",input:"I work at Maple Research Labs and have a work complaint.",expectedCategories:["works-at","employment"],mustHide:["Maple Research Labs"],mustKeep:["work complaint"]},
  {id:"work-india",input:"I am employed by Lotus Cloud Systems and face a disciplinary hearing.",expectedCategories:["works-at","employment"],mustHide:["Lotus Cloud Systems"],mustKeep:["disciplinary hearing"]},
  {id:"work-australia",input:"My employer is Southern Wave Studio and my salary is delayed.",expectedCategories:["works-at","employment","financial"],mustHide:["Southern Wave Studio"],mustKeep:["salary"]},
  {id:"work-germany",input:"An employee of Rhine Motor Works needs job termination advice.",expectedCategories:["works-at","employment"],mustHide:["Rhine Motor Works"],mustKeep:["job termination"]},

  {id:"patient-lagos",input:"I am a patient at Blue Lagoon Hospital and need a test result explained.",expectedCategories:["patient-at","health"],mustHide:["Blue Lagoon Hospital"],mustKeep:["test result"]},
  {id:"patient-accra",input:"My hospital is Golden Care Centre and I need medication guidance.",expectedCategories:["patient-at","health"],mustHide:["Golden Care Centre"],mustKeep:["medication"]},
  {id:"patient-cairo",input:"My clinic is Nile Family Clinic and I want to discuss symptoms.",expectedCategories:["patient-at","health"],mustHide:["Nile Family Clinic"],mustKeep:["symptoms"]},
  {id:"patient-tokyo",input:"I am a patient at Sakura Health Centre and need prescription advice.",expectedCategories:["patient-at","health"],mustHide:["Sakura Health Centre"],mustKeep:["prescription"]},
  {id:"patient-berlin",input:"My hospital is Central Medical House and I need diagnosis support.",expectedCategories:["patient-at","health"],mustHide:["Central Medical House"],mustKeep:["diagnosis"]},
  {id:"patient-cape-town",input:"My clinic is Table View Clinic and I need counselling advice.",expectedCategories:["patient-at","personal-support","health"],mustHide:["Table View Clinic"],mustKeep:["counselling"]},

  {id:"member-union",input:"I am a member of National Textile Union and need political opinion advice.",expectedCategories:["member-of","political"],mustHide:["National Textile Union"],mustKeep:["political opinion"]},
  {id:"member-association",input:"I belong to Young Farmers Association and want to discuss a campaign volunteer role.",expectedCategories:["member-of","political"],mustHide:["Young Farmers Association"],mustKeep:["campaign volunteer"]},
  {id:"member-trade",input:"My union is Coastal Trade Union and I have a work complaint.",expectedCategories:["member-of","employment"],mustHide:["Coastal Trade Union"],mustKeep:["work complaint"]},
  {id:"member-faith",input:"I am a member of New Dawn Fellowship and need religious advice.",expectedCategories:["member-of","religion-belief"],mustHide:["New Dawn Fellowship"],mustKeep:["religious"]},
  {id:"member-activist",input:"I belong to Green Future Movement and want to discuss being an activist.",expectedCategories:["member-of","political"],mustHide:["Green Future Movement"],mustKeep:["activist"]},
  {id:"member-professional",input:"I am a member of Global Nurses Forum and need workplace advice.",expectedCategories:["member-of","employment"],mustHide:["Global Nurses Forum"],mustKeep:["workplace"]},

  {id:"client-lawyer",input:"I am a client of Bright Law Chambers and need court case guidance.",expectedCategories:["client-of","legal"],mustHide:["Bright Law Chambers"],mustKeep:["court case"]},
  {id:"client-accountant",input:"My accountant is Cedar Finance Partners and I need tax return advice.",expectedCategories:["client-of","financial"],mustHide:["Cedar Finance Partners"],mustKeep:["tax return"]},
  {id:"client-solicitor",input:"My lawyer is River Stone Legal and I need settlement advice.",expectedCategories:["client-of","legal"],mustHide:["River Stone Legal"],mustKeep:["settlement"]},
  {id:"client-arbitration",input:"I am a client of Meridian Legal House and need arbitration guidance.",expectedCategories:["client-of","legal"],mustHide:["Meridian Legal House"],mustKeep:["arbitration"]},
  {id:"client-custody",input:"My lawyer is Family Justice Centre and I face a custody dispute.",expectedCategories:["client-of","legal","family"],mustHide:["Family Justice Centre"],mustKeep:["custody dispute"]},
  {id:"client-contract",input:"I am a client of Harbour Counsel Group and need contract dispute advice.",expectedCategories:["client-of","legal"],mustHide:["Harbour Counsel Group"],mustKeep:["contract dispute"]},

  {id:"email-nigeria",input:"Send salary guidance to kemi.ade@example.ng please.",expectedCategories:["email","employment","financial"],mustHide:["kemi.ade@example.ng"],mustKeep:["salary guidance"]},
  {id:"email-france",input:"My medical record is linked to elodie+care@example.fr.",expectedCategories:["email","health"],mustHide:["elodie+care@example.fr"],mustKeep:["medical record"]},
  {id:"email-india",input:"Contact priya_sharma@example.in about the legal case.",expectedCategories:["email","legal"],mustHide:["priya_sharma@example.in"],mustKeep:["legal case"]},
  {id:"email-japan",input:"Use kenji.sato@example.jp for the test result.",expectedCategories:["email","health"],mustHide:["kenji.sato@example.jp"],mustKeep:["test result"]},
  {id:"email-company",input:"The work complaint came from staff@northbridge.co.uk.",expectedCategories:["email","employment"],mustHide:["staff@northbridge.co.uk"],mustKeep:["work complaint"]},

  {id:"phone-nigeria",input:"Call me on +234 803 123 4567 about my prescription.",expectedCategories:["phone","health"],mustHide:["+234 803 123 4567"],mustKeep:["prescription"]},
  {id:"phone-us",input:"My phone is +1 (415) 555-0136 and this concerns a debt.",expectedCategories:["phone","financial"],mustHide:["+1 (415) 555-0136"],mustKeep:["debt"]},
  {id:"phone-uk",input:"Reach me at +44 20 7946 0958 about the court case.",expectedCategories:["phone","legal"],mustHide:["+44 20 7946 0958"],mustKeep:["court case"]},
  {id:"phone-india",input:"My number is +91 98765 43210 for counselling follow-up.",expectedCategories:["phone","personal-support","health"],mustHide:["+91 98765 43210"],mustKeep:["counselling"]},
  {id:"phone-kenya",input:"Contact +254 712 345678 regarding delayed wages.",expectedCategories:["phone","employment"],mustHide:["+254 712 345678"],mustKeep:["delayed wages"]},

  {id:"owner-founder",input:"Dr. Amina Yusuf founded Solar Ridge Labs and needs market advice.",expectedCategories:["identity","organization"],mustHide:["Amina Yusuf","Solar Ridge Labs"],mustKeep:["market advice"]},
  {id:"owner-runs",input:"Mr Chen Wei runs Jade Harbor Systems and faces a lawsuit.",expectedCategories:["identity","organization","legal"],mustHide:["Chen Wei","Jade Harbor Systems"],mustKeep:["lawsuit"]},
  {id:"owner-leads",input:"Ms. Sofia Rossi leads Olive Tree Media and reports harassment.",expectedCategories:["identity","organization","criminal-allegation"],mustHide:["Sofia Rossi","Olive Tree Media"],mustKeep:["harassment"]},
  {id:"owner-chief",input:"Chief Bayo Afolabi owns Copper Field Works and has delayed salaries.",expectedCategories:["identity","organization","employment","financial"],mustHide:["Bayo Afolabi","Copper Field Works"],mustKeep:["delayed salaries"]},
  {id:"owner-prof",input:"Prof. Anna Müller founded Alpine Data House and wants launch advice.",expectedCategories:["identity","organization"],mustHide:["Anna Müller","Alpine Data House"],mustKeep:["launch advice"]},
  {id:"owner-doctor",input:"Dr. Lucía Torres runs Pacific Care Labs and needs legal case advice.",expectedCategories:["identity","organization","legal"],mustHide:["Lucía Torres","Pacific Care Labs"],mustKeep:["legal case"]},

  {id:"location-lagos",input:"The office is located in Yaba, Lagos and staff report late wages.",expectedCategories:["location","employment"],mustHide:["Yaba","Lagos"],mustKeep:["late wages"]},
  {id:"location-abuja",input:"The company is located in Wuse, Abuja and has a work complaint.",expectedCategories:["location","employment"],mustHide:["Wuse","Abuja"],mustKeep:["work complaint"]},
  {id:"location-london",input:"The workplace is located in Camden, London and faces redundancy.",expectedCategories:["location","employment"],mustHide:["Camden","London"],mustKeep:["redundancy"]},
  {id:"location-nairobi",input:"The business is located in Westlands, Nairobi and needs debt advice.",expectedCategories:["location","financial"],mustHide:["Westlands","Nairobi"],mustKeep:["debt advice"]},
  {id:"location-toronto",input:"The employer is located in Scarborough, Toronto and delayed salary.",expectedCategories:["location","employment","financial"],mustHide:["Scarborough","Toronto"],mustKeep:["delayed salary"]},
  {id:"location-accra",input:"The office is located in Osu, Accra and needs work ethic guidance.",expectedCategories:["location","employment"],mustHide:["Osu","Accra"],mustKeep:["work ethic"]},

  {id:"address-nigeria",input:"Send the legal notice to 18 Allen Avenue tomorrow.",expectedCategories:["address"],mustHide:["18 Allen Avenue"],mustKeep:["legal notice"]},
  {id:"address-us",input:"My medical package goes to 742 Evergreen Road today.",expectedCategories:["address","health"],mustHide:["742 Evergreen Road"],mustKeep:["medical package"]},
  {id:"address-uk",input:"Deliver the court papers to 10 King Street privately.",expectedCategories:["address"],mustHide:["10 King Street"],mustKeep:["court papers"]},
  {id:"address-canada",input:"The report should reach 55 Maple Drive tomorrow.",expectedCategories:["address"],mustHide:["55 Maple Drive"],mustKeep:["report"]},

  {id:"ip-public",input:"The internal dashboard runs on 10.0.0.24 and stores a fingerprint.",expectedCategories:["network","biometric"],mustHide:["10.0.0.24"],mustKeep:["fingerprint"]},
  {id:"ip-europe",input:"Investigate server 172.16.20.5 for possible fraud.",expectedCategories:["network","criminal-allegation"],mustHide:["172.16.20.5"],mustKeep:["fraud"]},
  {id:"ip-cloud",input:"The private server is 203.0.113.42 and contains medical records.",expectedCategories:["network","health"],mustHide:["203.0.113.42"],mustKeep:["medical records"]},

  {id:"id-nigeria",input:"My NIN 12345678901 is attached to the bank statement.",expectedCategories:["government-id","financial"],mustHide:["12345678901"],mustKeep:["bank statement"]},
  {id:"id-passport",input:"Passport number A90817263 appears in the legal case.",expectedCategories:["government-id","legal"],mustHide:["A90817263"],mustKeep:["legal case"]},
  {id:"id-national",input:"National ID ZX-445566 belongs in the medical record.",expectedCategories:["government-id","health"],mustHide:["ZX-445566"],mustKeep:["medical record"]},

  {id:"card-spaced",input:"My payment card is 4111 1111 1111 1111 and I need debt advice.",expectedCategories:["finance","financial"],mustHide:["4111 1111 1111 1111"],mustKeep:["debt advice"]},
  {id:"card-hyphen",input:"Remove 5555-5555-5555-4444 from the bank statement.",expectedCategories:["finance","financial"],mustHide:["5555-5555-5555-4444"],mustKeep:["bank statement"]},

  {id:"context-politics",input:"Help me think through my voting intention without judging me.",expectedCategories:["political"],mustKeep:["voting intention"]},
  {id:"context-genetics",input:"Explain what my genetic data could mean in simple language.",expectedCategories:["biometric"],mustKeep:["genetic data"]},
  {id:"context-sexuality",input:"I need support discussing my sexual orientation with my family.",expectedCategories:["sexuality","family"],mustKeep:["sexual orientation","family"]},

  {id:"secret-formula",input:"Our confidential business idea uses a proprietary formula for clean paint. Suggest a launch plan.",expectedCategories:["confidential-asset"],mustHide:["proprietary formula for clean paint"],mustKeep:["Suggest a launch plan"]},
  {id:"secret-prototype",input:"My private product idea is an unreleased prototype that sorts waste using a unique sensor. Help me assess the market.",expectedCategories:["confidential-asset"],mustHide:["unique sensor"],mustKeep:["Help me assess the market"]},
  {id:"secret-method",input:"Our secret startup technology is a proprietary method for low-cost cooling. Create a business model.",expectedCategories:["confidential-asset"],mustHide:["proprietary method for low-cost cooling"],mustKeep:["Create a business model"]},
];

export const FULL_PRIVACY_BENCHMARK: PrivacyCase[] = [...PRIVACY_CORPUS, ...INTERNATIONAL_CASES];
