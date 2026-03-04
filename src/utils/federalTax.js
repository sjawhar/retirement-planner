import {
  BRACKETS_SINGLE,
  BRACKETS_MFJ,
  STANDARD_DEDUCTION,
  AGE_65_DEDUCTION,
  SS_PROVISIONAL_THRESHOLDS,
} from "../constants";

/**
 * Calculate federal income tax using progressive brackets.
 * @param {number} taxableIncome - Income after deductions
 * @param {string} filing - "single" or "mfj"
 * @returns {number} Federal tax owed
 */
export function calcFederalTax(taxableIncome, filing) {
  const brackets = filing === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;
  let tax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return Math.max(0, tax);
}

/**
 * Get the marginal tax rate for a given taxable income level.
 */
export function getMarginalRate(taxableIncome, filing) {
  const brackets = filing === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) return bracket.rate;
  }

  return 0.37; // Top bracket
}

/**
 * Calculate the taxable portion of Social Security benefits.
 * Uses the provisional income formula with 50%/85% thresholds.
 *
 * Provisional income = AGI (excluding SS) + tax-exempt interest + 50% of SS
 *
 * @param {number} ssIncome - Total Social Security benefits received
 * @param {number} otherAGI - All other AGI (pension, TSP, investment, etc.)
 * @param {string} filing - "single" or "mfj"
 * @returns {number} Taxable portion of Social Security
 */
export function calcSSTaxable(ssIncome, otherAGI, filing) {
  if (ssIncome <= 0) return 0;

  const thresholds =
    SS_PROVISIONAL_THRESHOLDS[filing === "mfj" ? "mfj" : "single"];
  const provisionalIncome = otherAGI + ssIncome * 0.5;

  let taxable = 0;

  if (provisionalIncome > thresholds.upper) {
    // Up to 85% taxable
    taxable = Math.min(
      0.85 * ssIncome,
      0.85 * (provisionalIncome - thresholds.upper) +
        0.5 * (thresholds.upper - thresholds.lower)
    );
  } else if (provisionalIncome > thresholds.lower) {
    // Up to 50% taxable
    taxable = Math.min(
      0.5 * ssIncome,
      0.5 * (provisionalIncome - thresholds.lower)
    );
  }

  return Math.max(0, Math.min(taxable, 0.85 * ssIncome));
}

/**
 * Calculate standard deduction including age-65 additional amounts.
 */
export function getStandardDeduction(filing, age, spouseAge = 0) {
  let deduction = STANDARD_DEDUCTION[filing === "mfj" ? "mfj" : "single"];

  if (age >= 65) {
    deduction +=
      filing === "mfj"
        ? AGE_65_DEDUCTION.mfj_per_spouse
        : AGE_65_DEDUCTION.single;
  }

  if (filing === "mfj" && spouseAge >= 65) {
    deduction += AGE_65_DEDUCTION.mfj_per_spouse;
  }

  return deduction;
}
