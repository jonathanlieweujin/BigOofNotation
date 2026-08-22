import { ActionEnum } from "./constants/ActionEnum";

/* ---- Branding ---- */
/* Change these two lines to rename the app everywhere. Logo: swap
   public/logo.svg and the mark in styles/Nav.css. */
export const APP_NAME = "AppName";
export const APP_TAGLINE = "Retention that acts, not notifies.";

/* Single source of demo data. No backend, swap these exports for API calls later.
   Shapes follow the taxonomy in track/track.md. */

/* ---- Reference tables (the decision layer, as data not code) ---- */

export const DIAGNOSES = {
  UNRESOLVED_FRICTION: {
    id: "UNRESOLVED_FRICTION",
    label: "Unresolved friction",
    blurb: "Told us, still stuck",
    needState: "COMPETENCE",
    lever: "Route to fix / workaround",
    costToBusiness: "Engineering time",
  },
  UNREALISED_VALUE: {
    id: "UNREALISED_VALUE",
    label: "Unrealised value",
    blurb: "Paying, never activated",
    needState: "COMPETENCE",
    lever: "Hands-on setup, done-for-you",
    costToBusiness: "CSM hours",
  },
  WRONG_FIT: {
    id: "WRONG_FIT",
    label: "Wrong fit",
    blurb: "Paying for the wrong thing",
    needState: "AUTONOMY",
    lever: "Proactively downgrade them",
    costToBusiness: "Revenue, now",
  },
  VALUE_DOUBT: {
    id: "VALUE_DOUBT",
    label: "Value doubt",
    blurb: "Usage fine, renewal near",
    needState: "AUTONOMY",
    lever: "Show realised ROI",
    costToBusiness: "Reporting effort",
  },
  RELATIONSHIP_GAP: {
    id: "RELATIONSHIP_GAP",
    label: "Relationship gap",
    blurb: "No human contact",
    needState: "RELATEDNESS",
    lever: "Named human, real ownership",
    costToBusiness: "Headcount",
  },
};

export const NEED_STATES = {
  COMPETENCE: {
    id: "COMPETENCE",
    label: "Competence",
    feeling: "“I can’t make this work”",
    fits: "Remove the obstacle: fix, workaround, done-for-you setup",
    backfires: "A discount, implies they’re cheap, and it’s still broken",
  },
  AUTONOMY: {
    id: "AUTONOMY",
    label: "Autonomy",
    feeling: "“I feel trapped / oversold”",
    fits: "Give control back: downgrade, pause, self-serve exit",
    backfires: "Retention pressure, deepens the trapped feeling",
  },
  RELATEDNESS: {
    id: "RELATEDNESS",
    label: "Relatedness",
    feeling: "“Nobody noticed me”",
    fits: "A named human taking ownership",
    backfires: "Automated drip, proves nobody noticed",
  },
};

/* Evidence weights, ordered by falsifiability. Text-only input, so every
   tier here is self-reported, see track.md 4. */
export const EVIDENCE_WEIGHTS = {
  STATED_GOAL_REPEATED: { label: "Stated unmet goal, repeated", weight: 5 },
  STATED_GOAL_SINGLE: { label: "Stated unmet goal, single mention", weight: 4 },
  ACCOUNT_MISMATCH: { label: "Contract/account mismatch", weight: 3 },
  ASPECT_SENTIMENT: { label: "Aspect-based sentiment", weight: 3 },
  EMOTION: { label: "Emotion classification", weight: 2 },
  GENERIC_SENTIMENT: { label: "Generic sentiment score", weight: 1 },
};

export const CONFIDENCE_TIERS = {
  HIGH: { id: "HIGH", label: ActionEnum.ACT, badge: "bad", min: 11 },
  MEDIUM: { id: "MEDIUM", label: ActionEnum.REVIEW, badge: "warn", min: 7 },
  LOW: { id: "LOW", label: ActionEnum.LOG, badge: "good", min: 0 },
};

export const ACTIONS = {
  WORKAROUND: { label: "Micro-guide / workaround", cost: "Near zero", reversible: "Yes" },
  CSM_SETUP: { label: "CSM setup session", cost: "Staff hours", reversible: "Yes" },
  NAMED_OWNER: { label: "Named human ownership", cost: "Headcount", reversible: "Partly" },
  ENG_FIX: { label: "Engineering fix", cost: "Eng time (high)", reversible: "No" },
  DOWNGRADE: { label: "Proactive downgrade", cost: "Revenue, immediately", reversible: "No" },
  DISCOUNT: { label: "Discount", cost: "Margin, recurring", reversible: "Hard to unwind" },
};

/* ---- Accounts ---- */

export const ACCOUNTS = [
  {
    id: "acme",
    name: "Acme Corp",
    mrr: 4200,
    ltv: 151200,
    seats: { paid: 50, active: 6 },
    renewalInDays: 74,
    diagnosis: "UNRESOLVED_FRICTION",
    confidence: 13,
    tier: "HIGH",
    why: "Reported the export failing in two separate calls three weeks apart. No fix shipped, no follow-up logged.",
    evidence: [
      { type: "STATED_GOAL_REPEATED", detail: "“export still times out”, calls on 12 Jun and 3 Jul" },
      { type: "ASPECT_SENTIMENT", detail: "Negative sentiment on aspect: export (−0.8)" },
      { type: "EMOTION", detail: "Frustration detected, both transcripts" },
    ],
    recommended: "ENG_FIX",
    rejected: [
      { action: "DISCOUNT", reason: "Competence problem, a discount does not unblock the export" },
      { action: "DOWNGRADE", reason: "They want the feature to work, not to pay less" },
    ],
    frictionId: "export-timeout",
    timeline: [
      { date: "2026-06-12", event: "Call: export fails on large datasets", kind: "call" },
      { date: "2026-06-28", event: "Feedback form: “still waiting on export fix”", kind: "form" },
      { date: "2026-07-03", event: "Call: raised again, calmer tone", kind: "call" },
    ],
  },
  {
    id: "northwind",
    name: "Northwind Ltd",
    mrr: 2800,
    ltv: 100800,
    seats: { paid: 40, active: 5 },
    renewalInDays: 21,
    diagnosis: "WRONG_FIT",
    confidence: 12,
    tier: "HIGH",
    why: "Paying for 40 seats, 5 active for three months. Asked about cheaper plans on the last call.",
    evidence: [
      { type: "STATED_GOAL_SINGLE", detail: "“is there a smaller plan?”, call 14 Jul" },
      { type: "ACCOUNT_MISMATCH", detail: "40 seats paid, 5 active (87% unused), 3 months running" },
      { type: "EMOTION", detail: "Resentment markers around pricing" },
    ],
    recommended: "DOWNGRADE",
    rejected: [
      { action: "DISCOUNT", reason: "Masks the mismatch, they would still be on the wrong plan" },
      { action: "CSM_SETUP", reason: "Not an activation problem; they do not need the extra seats" },
    ],
    frictionId: null,
    timeline: [
      { date: "2026-05-30", event: "Feedback form: “paying for more than we use”", kind: "form" },
      { date: "2026-07-14", event: "Call: asked about smaller plans", kind: "call" },
    ],
  },
  {
    id: "globex",
    name: "Globex",
    mrr: 1600,
    ltv: 57600,
    seats: { paid: 20, active: 18 },
    renewalInDays: 132,
    diagnosis: "UNRESOLVED_FRICTION",
    confidence: 9,
    tier: "MEDIUM",
    why: "One report of the same export problem Acme raised. Single mention, so unconfirmed.",
    evidence: [
      { type: "STATED_GOAL_SINGLE", detail: "“export is slow for us too”, form 8 Jul" },
      { type: "ASPECT_SENTIMENT", detail: "Negative sentiment on aspect: export (−0.5)" },
    ],
    recommended: "WORKAROUND",
    rejected: [
      { action: "ENG_FIX", reason: "Not individually justified at this LTV, counts toward the batched fix instead" },
      { action: "DISCOUNT", reason: "Competence problem, wrong lever" },
    ],
    frictionId: "export-timeout",
    timeline: [
      { date: "2026-07-08", event: "Feedback form: export slow on large reports", kind: "form" },
    ],
  },
  {
    id: "initech",
    name: "Initech",
    mrr: 5400,
    ltv: 194400,
    seats: { paid: 60, active: 52 },
    renewalInDays: 45,
    diagnosis: "RELATIONSHIP_GAP",
    confidence: 8,
    tier: "MEDIUM",
    why: "High value, healthy usage, but no human contact in 7 months. Flat, transactional language.",
    evidence: [
      { type: "ACCOUNT_MISMATCH", detail: "Top-decile LTV, zero touchpoints in 214 days" },
      { type: "EMOTION", detail: "Flat/disengaged tone in last form response" },
    ],
    recommended: "NAMED_OWNER",
    rejected: [
      { action: "DISCOUNT", reason: "No price complaint, would invent a problem" },
      { action: "WORKAROUND", reason: "Nothing is broken; usage is healthy" },
    ],
    frictionId: null,
    timeline: [
      { date: "2025-12-19", event: "Last human contact (onboarding CSM left)", kind: "note" },
      { date: "2026-06-02", event: "Feedback form: neutral, one-word answers", kind: "form" },
    ],
  },
  {
    id: "hooli",
    name: "Hooli",
    mrr: 900,
    ltv: 32400,
    seats: { paid: 12, active: 11 },
    renewalInDays: 88,
    diagnosis: "UNREALISED_VALUE",
    confidence: 7,
    tier: "MEDIUM",
    why: "Onboarded 60 days ago, never used the reporting module they cited as the reason for buying.",
    evidence: [
      { type: "STATED_GOAL_SINGLE", detail: "“we bought this for the reports”, onboarding call" },
      { type: "ACCOUNT_MISMATCH", detail: "Reporting module untouched since signup" },
    ],
    recommended: "CSM_SETUP",
    rejected: [
      { action: "DISCOUNT", reason: "They have not received the value yet, discounting confirms it is not worth it" },
      { action: "DOWNGRADE", reason: "Premature: the plan may be right once activated" },
    ],
    frictionId: null,
    timeline: [
      { date: "2026-06-20", event: "Onboarding call: reporting named as primary need", kind: "call" },
    ],
  },
  /* Deliberately below the action threshold, the demo must show the
     system DECLINING to act. See track.md 4, fail-safe default. */
  {
    id: "vandelay",
    name: "Vandelay Industries",
    mrr: 2100,
    ltv: 75600,
    seats: { paid: 25, active: 22 },
    renewalInDays: 160,
    diagnosis: "VALUE_DOUBT",
    confidence: 3,
    tier: "LOW",
    why: "One mildly negative survey comment and nothing else. Not enough to act on.",
    evidence: [
      { type: "GENERIC_SENTIMENT", detail: "Survey free-text scored −0.2 (weak, single source)" },
    ],
    recommended: null,
    rejected: [
      { action: "DISCOUNT", reason: "No corroboration, one remark cannot trigger a concession" },
      { action: "CSM_SETUP", reason: "No stated cause to address" },
    ],
    frictionId: null,
    timeline: [
      { date: "2026-07-11", event: "Survey: “it’s fine I guess”", kind: "form" },
    ],
  },
];

/* ---- Friction queue: accounts grouped by stated cause ---- */

export const FRICTION = [
  {
    id: "export-timeout",
    cause: "Export times out on large datasets",
    accountIds: ["acme", "globex"],
    accountCount: 17,
    arrAffected: 40000,
    trend: "growing",
    firstSeen: "2026-05-02",
  },
  {
    id: "sso-setup",
    cause: "SSO setup fails silently at step 3",
    accountIds: [],
    accountCount: 9,
    arrAffected: 23500,
    trend: "flat",
    firstSeen: "2026-04-18",
  },
  {
    id: "mobile-sync",
    cause: "Mobile app does not sync offline edits",
    accountIds: [],
    accountCount: 6,
    arrAffected: 11200,
    trend: "shrinking",
    firstSeen: "2026-03-27",
  },
];

/* ---- Impact / measurement (seeded) ---- */

export const IMPACT = {
  retainedRevenueNet: 128400,
  concessionCost: 21600,
  interventionsCommitted: 43,
  concessionBudget: { used: 21600, ceiling: 40000 },
  accountsUnderObservation: 12,

  /* Matched action vs generic-discount baseline, per diagnosis class. */
  matchedVsBaseline: [
    { diagnosis: "UNRESOLVED_FRICTION", matched: 71, baseline: 38 },
    { diagnosis: "WRONG_FIT", matched: 64, baseline: 29 },
    { diagnosis: "UNREALISED_VALUE", matched: 58, baseline: 41 },
    { diagnosis: "VALUE_DOUBT", matched: 52, baseline: 44 },
    { diagnosis: "RELATIONSHIP_GAP", matched: 61, baseline: 35 },
  ],

  repeatChurnSameCause: { before: 0.34, after: 0.11 },
};

/* ---- Derived helpers ---- */

export const diagnosisMix = () =>
  Object.values(DIAGNOSES)
    .map((d) => ({
      id: d.id,
      label: d.label,
      count: ACCOUNTS.filter((a) => a.diagnosis === d.id).length,
    }))
    .sort((a, b) => b.count - a.count);

export const getAccount = (id) => ACCOUNTS.find((a) => a.id === id);

export const confidenceTier = (score) =>
  score >= CONFIDENCE_TIERS.HIGH.min
    ? CONFIDENCE_TIERS.HIGH
    : score >= CONFIDENCE_TIERS.MEDIUM.min
    ? CONFIDENCE_TIERS.MEDIUM
    : CONFIDENCE_TIERS.LOW;

/* Ranked by expected value of intervening, not raw risk. */
export const rankedAccounts = () =>
  [...ACCOUNTS].sort((a, b) => b.confidence * b.ltv - a.confidence * a.ltv);

/* ---- Auth (hardcoded, no backend) ---- */

export const CREDENTIALS = { username: "admin1", password: "admin" };

export const DEMO_USER = {
  name: "Admin",
  username: "admin1",
  email: "admin1@appname.io",
};

export const checkLogin = (username, password) =>
  username.trim() === CREDENTIALS.username && password === CREDENTIALS.password;
