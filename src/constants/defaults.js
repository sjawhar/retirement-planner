// Default input values — used for initial state and "Reset" button
export const DEFAULTS = {
  currentAge: 57,
  retireAge: 60,
  spouseAge: 56,
  filing: "mfj",
  monthlyPension: 800, // Eduardo's FERS pension, monthly
  spousePension: 800, // Elizabeth's FERS pension, monthly
  tspTraditional: 350000, // Eduardo's TSP Traditional
  spouseTspTraditional: 350000, // Elizabeth's TSP Traditional
  tspRoth: 0, // Eduardo's TSP Roth (none currently)
  spouseTspRoth: 0, // Elizabeth's TSP Roth (none currently)
  ssPIA: 2400,
  ssClaimAge: 67,
  spouseSsPIA: 0, // monthly PIA
  spouseSsClaimAge: 67,
  homeValue: 750000, // Utah home estimated sale value
  homeCostBasis: 305000, // original purchase price
  homeSaleAge: 59, // sell Sept 2028
  investmentIncome: 0, // US-reported only (Peru rental income kept in Peru, not on US taxes)
  peruPropertyCost: 170000, // future Peru primary residence purchase
  peruPropertyAge: 60, // age at purchase
  peruRentalIncome: 15500, // ~4,400 soles/mo (~$1,294 USD/mo) — stays in Peru, not on US taxes
  monthlySpending: 4000, // US-side monthly spending (Peru covered by rental income)
  annualTravelBudget: 12000, // travel: US, South America, international (~$1,000/mo)
  selectedState: "Utah",
  conversionStrategy: "fill12",
  healthInsurance: "fehb",
  healthInsuranceCost: 800, // monthly
  inflationRate: 0.025,
  targetEndAge: 90, // aim to spend everything by this age
};

// Short URL parameter keys → full state field names
// Keeps shared URLs compact
export const PARAM_MAP = {
  a: "currentAge",
  r: "retireAge",
  s: "spouseAge",
  f: "filing",
  p: "monthlyPension",
  sp2: "spousePension",
  tt: "tspTraditional",
  stt: "spouseTspTraditional",
  tr: "tspRoth",
  str: "spouseTspRoth",
  sp: "ssPIA",
  sc: "ssClaimAge",
  ssp: "spouseSsPIA",
  ssc: "spouseSsClaimAge",
  hv: "homeValue",
  hb: "homeCostBasis",
  ha: "homeSaleAge",
  ii: "investmentIncome",
  pc: "peruPropertyCost",
  pa: "peruPropertyAge",
  pr: "peruRentalIncome",
  tb: "annualTravelBudget",
  ms: "monthlySpending",
  st: "selectedState",
  cs: "conversionStrategy",
  hi: "healthInsurance",
  hc: "healthInsuranceCost",
  ir: "inflationRate",
  te: "targetEndAge",
};

// Fields that should be parsed as numbers (vs strings)
export const NUMERIC_FIELDS = new Set([
  "currentAge",
  "retireAge",
  "spouseAge",
  "monthlyPension",
  "spousePension",
  "tspTraditional",
  "spouseTspTraditional",
  "tspRoth",
  "spouseTspRoth",
  "ssPIA",
  "ssClaimAge",
  "spouseSsPIA",
  "spouseSsClaimAge",
  "homeValue",
  "homeCostBasis",
  "homeSaleAge",
  "investmentIncome",
  "peruPropertyCost",
  "peruPropertyAge",
  "peruRentalIncome",
  "annualTravelBudget",
  "monthlySpending",
  "healthInsuranceCost",
  "inflationRate",
  "targetEndAge",
]);

// Growth rate assumption for TSP balance projections
export const ANNUAL_GROWTH_RATE = 0.05;

// Projection end age
export const MAX_PROJECTION_AGE = 92;
