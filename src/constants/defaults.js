// Default input values — used for initial state and "Reset" button
export const DEFAULTS = {
  currentAge: 57,
  retireAge: 60,
  spouseAge: 56,
  filing: "mfj",
  monthlyPension: 850,       // renamed from pension, now monthly
  spousePension: 800,        // monthly
  tspTraditional: 600000,
  tspRoth: 100000,
  ssPIA: 2400,
  ssClaimAge: 67,
  spouseSsPIA: 0,            // monthly PIA
  spouseSsClaimAge: 67,
  homeSaleGain: 0,
  homeSaleYear: 62,
  investmentIncome: 5000,
  monthlySpending: 5000,     // renamed from livingExpenses, now monthly
  selectedState: "Utah",     // changed from Virginia
  conversionStrategy: "fill12",
  healthInsurance: "fehb",
  healthInsuranceCost: 800,  // monthly
  inflationRate: 0.025,
};

// Short URL parameter keys → full state field names
// Keeps shared URLs compact
export const PARAM_MAP = {
  a: "currentAge",
  r: "retireAge",
  s: "spouseAge",
  f: "filing",
  p: "monthlyPension",      // was: pension
  sp2: "spousePension",
  tt: "tspTraditional",
  tr: "tspRoth",
  sp: "ssPIA",
  sc: "ssClaimAge",
  ssp: "spouseSsPIA",
  ssc: "spouseSsClaimAge",
  hg: "homeSaleGain",
  hy: "homeSaleYear",
  ii: "investmentIncome",
  ms: "monthlySpending",    // was: le (livingExpenses)
  st: "selectedState",
  cs: "conversionStrategy",
  hi: "healthInsurance",
  hc: "healthInsuranceCost",
  ir: "inflationRate",
};

// Fields that should be parsed as numbers (vs strings)
export const NUMERIC_FIELDS = new Set([
  "currentAge",
  "retireAge",
  "spouseAge",
  "monthlyPension",
  "spousePension",
  "tspTraditional",
  "tspRoth",
  "ssPIA",
  "ssClaimAge",
  "spouseSsPIA",
  "spouseSsClaimAge",
  "homeSaleGain",
  "homeSaleYear",
  "investmentIncome",
  "monthlySpending",
  "healthInsuranceCost",
  "inflationRate",
]);

// Growth rate assumption for TSP balance projections
export const ANNUAL_GROWTH_RATE = 0.05;

// Projection end age
export const MAX_PROJECTION_AGE = 92;
