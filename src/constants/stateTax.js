// State tax treatment of federal retirement income
//
// Each profile uses a simplified flat-rate model. Real state taxes
// have brackets, but for comparison purposes the effective rate on
// retirement income is what matters. Adjust rates to match your
// expected effective state rate.
//
// To add a state: copy an existing entry and update the fields.
// All dollar amounts are annual.

const STATE_TAX_PROFILES = {
  // ─── Tier 1: No income tax ──────────────────────────────────────
  Alaska: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Florida: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Nevada: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  "New Hampshire": {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax (as of 2025)",
  },
  "South Dakota": {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Tennessee: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Texas: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Washington: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },
  Wyoming: {
    rate: 0,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "No income tax",
  },

  // ─── Tier 2: Has income tax but exempts all retirement income ───
  Illinois: {
    rate: 0.0495,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "All retirement income exempt",
  },
  Iowa: {
    rate: 0.038,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "Retirement income exempt age 55+",
  },
  Mississippi: {
    rate: 0.044,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "All retirement income exempt",
  },
  Pennsylvania: {
    rate: 0.0307,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: true,
    label: "All retirement income exempt",
  },

  // ─── Tier 3: Partial exemptions ─────────────────────────────────
  Alabama: {
    rate: 0.04,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: false,
    tspExemption: 6000,
    ageReq: 65,
    label: "Pensions exempt; TSP $6K at 65+",
  },
  Colorado: {
    rate: 0.044,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    retirementExemption: 24000,
    ageReq: 65,
    label: "$24K exemption at 65+; SS exempt at 65+",
  },
  Delaware: {
    rate: 0.066,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    retirementExemption: 12500,
    ageReq: 60,
    label: "$12.5K exemption at 60+; no sales tax",
  },
  Georgia: {
    rate: 0.0539,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    retirementExemption: 65000,
    ageReq: 65,
    label: "$65K exemption at 65+",
  },
  Maryland: {
    rate: 0.0575,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    pensionExemption: 41200,
    ageReq: 65,
    label: "$41.2K pension exemption at 65+",
  },
  "New York": {
    rate: 0.0685,
    pensionExempt: true,
    ssExempt: true,
    tspExempt: false,
    tspExemption: 20000,
    label: "Fed pension exempt; TSP $20K exempt",
  },
  "South Carolina": {
    rate: 0.0625,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    retirementExemption: 15000,
    ageReq: 65,
    label: "$15K exemption at 65+; SS exempt",
  },
  Virginia: {
    rate: 0.0575,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    ageDeduction: 12000,
    ageReq: 65,
    label: "$12K age deduction at 65+",
  },

  // ─── Tier 4: Mostly taxed ───────────────────────────────────────
  "North Carolina": {
    rate: 0.0425,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    label: "SS exempt; flat 4.25%",
  },

  // ─── Tier 5: Unfavorable ────────────────────────────────────────
  California: {
    rate: 0.093,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    label: "Taxes all retirement income (SS exempt)",
  },
  Oregon: {
    rate: 0.099,
    pensionExempt: false,
    ssExempt: true,
    tspExempt: false,
    label: "High rates; taxes all retirement income",
  },
};

export default STATE_TAX_PROFILES;

// Sorted state names for dropdown menus
export const STATE_NAMES = Object.keys(STATE_TAX_PROFILES).sort();

// Default states to compare in the State Comparison tab
export const DEFAULT_COMPARE_STATES = [
  "Pennsylvania",
  "Florida",
  "Texas",
  "North Carolina",
  "Georgia",
];
