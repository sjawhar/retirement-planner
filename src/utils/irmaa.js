import { IRMAA_THRESHOLDS_MFJ, IRMAA_THRESHOLDS_SINGLE, IRMAA_ANNUAL_SURCHARGE } from "../constants";

/**
 * Calculate annual IRMAA surcharge based on MAGI.
 * Note: IRMAA uses income from TWO years prior.
 * For married couples, both spouses pay the surcharge.
 *
 * @param {number} magi - Modified Adjusted Gross Income
 * @param {string} filing - "single" or "mfj"
 * @returns {number} Annual IRMAA surcharge (total for household)
 */
export function calcIRMAA(magi, filing) {
  const thresholds = filing === "mfj" ? IRMAA_THRESHOLDS_MFJ : IRMAA_THRESHOLDS_SINGLE;
  const multiplier = filing === "mfj" ? 2 : 1;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (magi > thresholds[i]) {
      return IRMAA_ANNUAL_SURCHARGE[i + 1] * multiplier;
    }
  }

  return 0; // Below first threshold — standard premium only
}
