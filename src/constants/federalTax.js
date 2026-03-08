// 2025 Federal Income Tax Brackets
// Source: IRS Revenue Procedure 2024-40, extended under OBBBA/TCJA permanence
// Update annually when IRS publishes new brackets (typically Oct/Nov)

export const BRACKETS_SINGLE = [
  { min: 0, max: 11925, rate: 0.1 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

export const BRACKETS_MFJ = [
  { min: 0, max: 23850, rate: 0.1 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

// Standard deductions
export const STANDARD_DEDUCTION = {
  single: 15750,
  mfj: 31500,
};

// Additional deduction for age 65+
export const AGE_65_DEDUCTION = {
  single: 2000,
  mfj_per_spouse: 1600,
};

// Social Security provisional income thresholds
// These have NOT been indexed since 1983/1993
export const SS_PROVISIONAL_THRESHOLDS = {
  single: { lower: 25000, upper: 34000 },
  mfj: { lower: 32000, upper: 44000 },
};

// 2025 Long-Term Capital Gains brackets
// Rate depends on total taxable income (ordinary + gains)
export const LTCG_BRACKETS_SINGLE = [
  { max: 48350, rate: 0 },
  { max: 533400, rate: 0.15 },
  { max: Infinity, rate: 0.2 },
];

export const LTCG_BRACKETS_MFJ = [
  { max: 96700, rate: 0 },
  { max: 600050, rate: 0.15 },
  { max: Infinity, rate: 0.2 },
];

// Section 121 Home Sale Exclusion
export const HOME_SALE_EXCLUSION = {
  single: 250000,
  mfj: 500000,
};

// Typical real estate selling costs (agent commissions, closing costs)
export const HOME_SELLING_COST_RATE = 0.06;
