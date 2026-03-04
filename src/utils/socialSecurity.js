/**
 * Estimate annual Social Security benefit based on PIA and claiming age.
 *
 * Claiming before Full Retirement Age (FRA = 67 for those born 1960+)
 * reduces benefits. Delaying past FRA earns delayed retirement credits
 * of 8% per year up to age 70.
 *
 * Simplified formula (approximation):
 *   Age 62: 70% of PIA
 *   Age 63–66: Linear increase from 70% to ~93.35%
 *   Age 67 (FRA): 100% of PIA
 *   Age 68–70: +8% per year (108%, 116%, 124%)
 *
 * @param {number} annualPIA - Primary Insurance Amount (annual, i.e. monthly PIA × 12)
 * @param {number} claimAge - Age at which benefits are first claimed
 * @returns {number} Estimated annual Social Security benefit
 */
export function calcSSBenefit(annualPIA, claimAge) {
  if (claimAge <= 62) return annualPIA * 0.7;
  if (claimAge <= 66) return annualPIA * (0.7 + (claimAge - 62) * 0.05);
  if (claimAge <= 67) return annualPIA * (0.9335 + (claimAge - 66) * 0.0665);
  if (claimAge <= 70) return annualPIA * (1.0 + (claimAge - 67) * 0.08);
  return annualPIA * 1.24; // Max at age 70
}

/**
 * Generate cumulative benefit data for a range of claiming ages.
 * Useful for break-even analysis charts.
 *
 * @param {number} monthlyPIA - Monthly PIA amount
 * @param {number[]} claimAges - Array of claiming ages to compare
 * @param {number} startAge - First age in the comparison (default 62)
 * @param {number} endAge - Last age in the comparison (default 92)
 * @returns {Array} Array of { claimAge, monthly, annual, cumulativeByAge }
 */
export function generateSSTimingData(
  monthlyPIA,
  claimAges = [62, 64, 67, 70],
  startAge = 62,
  endAge = 92
) {
  const annualPIA = monthlyPIA * 12;

  return claimAges.map((claimAge) => {
    const annual = calcSSBenefit(annualPIA, claimAge);
    const monthly = annual / 12;

    const cumulativeByAge = [];
    let cumulative = 0;

    for (let age = startAge; age <= endAge; age++) {
      if (age >= claimAge) cumulative += annual;
      cumulativeByAge.push({ age, cumulative });
    }

    return {
      claimAge,
      monthly: Math.round(monthly),
      annual: Math.round(annual),
      cumulativeByAge,
    };
  });
}
