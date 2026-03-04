// Default input values — used for initial state and "Reset" button
export const DEFAULTS = {
  currentAge: 58,
  retireAge: 60,
  spouseAge: 56,
  filing: "mfj",
  pension: 50000,
  tspTraditional: 600000,
  tspRoth: 100000,
  ssPIA: 2400,
  ssClaimAge: 67,
  homeSaleGain: 0,
  homeSaleYear: 62,
  investmentIncome: 5000,
  livingExpenses: 80000,
  selectedState: "Virginia",
  conversionStrategy: "fill12",
};

// Short URL parameter keys → full state field names
// Keeps shared URLs compact
export const PARAM_MAP = {
  a: "currentAge",
  r: "retireAge",
  s: "spouseAge",
  f: "filing",
  p: "pension",
  tt: "tspTraditional",
  tr: "tspRoth",
  sp: "ssPIA",
  sc: "ssClaimAge",
  hg: "homeSaleGain",
  hy: "homeSaleYear",
  ii: "investmentIncome",
  le: "livingExpenses",
  st: "selectedState",
  cs: "conversionStrategy",
};

// Fields that should be parsed as numbers (vs strings)
export const NUMERIC_FIELDS = new Set([
  "currentAge",
  "retireAge",
  "spouseAge",
  "pension",
  "tspTraditional",
  "tspRoth",
  "ssPIA",
  "ssClaimAge",
  "homeSaleGain",
  "homeSaleYear",
  "investmentIncome",
  "livingExpenses",
]);

// Growth rate assumption for TSP balance projections
export const ANNUAL_GROWTH_RATE = 0.05;

// Projection end age
export const MAX_PROJECTION_AGE = 92;
