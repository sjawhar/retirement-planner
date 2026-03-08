// Health insurance type defaults and Medicare constants
// Used by the projection engine to model pre-Medicare insurance costs
// Update MEDICARE_MONTHLY_COST annually as Part B premiums change

export const HEALTH_INSURANCE_DEFAULTS = {
  fehb: {
    label: "FEHB (Federal Employee Health Benefits)",
    monthlyPremium: 800,
    description: "Continued federal employee coverage",
  },
  aca: {
    label: "ACA Marketplace",
    monthlyPremium: 1200,
    description: "Income-based subsidies may reduce cost",
  },
  employer: {
    label: "Spouse's Employer Plan",
    monthlyPremium: 500,
    description: "Coverage through spouse's active employment",
  },
  none: {
    label: "No Coverage / Other",
    monthlyPremium: 0,
    description: "",
  },
};

// Medicare starts at age 65 for each spouse independently
export const MEDICARE_START_AGE = 65;

// Estimated monthly cost per person on Medicare (Part B + supplement)
// Standard Part B is ~$185/month in 2025; supplement adds ~$200-250/month
export const MEDICARE_MONTHLY_COST = 400;
