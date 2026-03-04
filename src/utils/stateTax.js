import { STATE_TAX_PROFILES } from "../constants";

/**
 * Calculate simplified state income tax for a federal retiree.
 *
 * Uses flat effective rates and models exemptions for pension,
 * Social Security, and TSP/retirement withdrawals.
 *
 * @param {string} state - State name (must match key in STATE_TAX_PROFILES)
 * @param {number} pension - Annual FERS/CSRS pension income
 * @param {number} ssIncome - Annual Social Security benefits
 * @param {number} tspWithdrawal - TSP/IRA withdrawals (excluding Roth)
 * @param {number} otherIncome - Investment income, home sale gains, etc.
 * @param {number} age - Retiree's age this year
 * @returns {number} Estimated state tax
 */
export function calcStateTax(state, pension, ssIncome, tspWithdrawal, otherIncome, age) {
  const profile = STATE_TAX_PROFILES[state];
  if (!profile || profile.rate === 0) return 0;

  let taxableIncome = 0;

  // Pension
  if (!profile.pensionExempt) {
    let pensionTaxable = pension;
    if (profile.pensionExemption && age >= (profile.ageReq || 0)) {
      pensionTaxable = Math.max(0, pension - profile.pensionExemption);
    }
    taxableIncome += pensionTaxable;
  }

  // Social Security
  if (!profile.ssExempt) {
    taxableIncome += ssIncome;
  }

  // TSP / retirement account withdrawals
  if (!profile.tspExempt) {
    let tspTaxable = tspWithdrawal;
    if (profile.tspExemption) {
      tspTaxable = Math.max(0, tspWithdrawal - profile.tspExemption);
    }
    taxableIncome += tspTaxable;
  }

  // Broad retirement income exemption (e.g., Georgia's $65K)
  if (profile.retirementExemption && age >= (profile.ageReq || 0)) {
    taxableIncome = Math.max(0, taxableIncome - profile.retirementExemption);
  }

  // Age-based deduction (e.g., Virginia's $12K at 65+)
  if (profile.ageDeduction && age >= (profile.ageReq || 0)) {
    taxableIncome = Math.max(0, taxableIncome - profile.ageDeduction);
  }

  // Non-retirement income is always taxed
  taxableIncome += otherIncome;

  return Math.max(0, taxableIncome * profile.rate);
}
