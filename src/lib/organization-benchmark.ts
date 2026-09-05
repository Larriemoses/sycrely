export type OrganizationCase = { id: string; prompt: string; organization: string; mustKeep: string };

const organizations = [
  "Olabest YT & Sons", "AfiStone Learning Centre", "Greyish Chamber", "BlueKola Foods Ltd", "EkoNimbus Research House",
  "CedarLagoon Hospital", "Riverglass Polytechnic", "Northstar Digital PLC", "MapleHarbour Clinic", "Unity Workers Union",
  "OakQuill Legal Chambers", "TideNest Farm Co-op", "Bright Path NGO", "Savannah Cloud Systems", "Golden Palm Ventures",
  "Harbour Counsel Group", "Crescent Business Academy", "Jade Harbor Systems", "Olive Tree Media", "Copper Field Works",
  "Atlantic Language College", "Southern Wave Studio", "Meridian Health Partners", "Sunrise Civic Foundation", "Rhine Motor Works",
];

const templates = [
  (org: string) => ({prompt:`His company is ${org} and it delayed my salary for five months.`,mustKeep:"delayed my salary"}),
  (org: string) => ({prompt:`Her employer is ${org} and I need workplace complaint advice.`,mustKeep:"workplace complaint advice"}),
  (org: string) => ({prompt:`Their firm is called ${org} and staff need general labour-rights guidance.`,mustKeep:"labour-rights guidance"}),
  (org: string) => ({prompt:`The business named ${org} is involved in a confidential contract dispute.`,mustKeep:"contract dispute"}),
  (org: string) => ({prompt:`I work for ${org} and want advice about late wages.`,mustKeep:"late wages"}),
  (org: string) => ({prompt:`She works with ${org} and needs help writing a professional grievance.`,mustKeep:"professional grievance"}),
  (org: string) => ({prompt:`He is the director of ${org} and employees report workplace bullying.`,mustKeep:"workplace bullying"}),
  (org: string) => ({prompt:`Our organization is named ${org} and we need a general privacy policy.`,mustKeep:"general privacy policy"}),
];

export const ORGANIZATION_BENCHMARK: OrganizationCase[] = organizations.flatMap((organization, organizationIndex) =>
  templates.map((template, templateIndex) => ({
    id: `org-${String(organizationIndex * templates.length + templateIndex + 1).padStart(3,"0")}`,
    organization,
    ...template(organization),
  })),
);
