import { RMD_DIVISOR_TABLE, RMD_START_AGE, RMD_FALLBACK_DIVISOR } from "../constants";

/**
 * Calculate Required Minimum Distribution for a given age and balance.
 * Returns 0 if below RMD start age or balance is zero.
 *
 * @param {number} age - Account owner's age this year
 * @param {number} traditionalBalance - Prior year-end traditional balance
 * @returns {number} Required minimum distribution amount
 */
export function calcRMD(age, traditionalBalance) {
  if (age < RMD_START_AGE || traditionalBalance <= 0) return 0;

  const divisor = RMD_DIVISOR_TABLE[age] || RMD_FALLBACK_DIVISOR;
  return traditionalBalance / divisor;
}
