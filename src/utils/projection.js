import {
  BRACKETS_SINGLE,
  BRACKETS_MFJ,
  ANNUAL_GROWTH_RATE,
  MAX_PROJECTION_AGE,
  MEDICARE_START_AGE,
  MEDICARE_MONTHLY_COST,
  HOME_SALE_EXCLUSION,
  HOME_SELLING_COST_RATE,
} from "../constants";
import {
  calcFederalTax,
  getMarginalRate,
  calcSSTaxable,
  getStandardDeduction,
  calcStateTax,
  calcIRMAA,
  calcRMD,
  calcSSBenefit,
  calcCapitalGainsTax,
} from "../utils";

/**
 * Run a full year-by-year retirement projection.
 *
 * Models: pension income, Social Security, TSP RMDs, Roth conversions,
 * home sale (value/basis with Section 121 exclusion), cash balance from
 * proceeds, Peru property purchase, federal/state taxes, IRMAA, and
 * account balance growth.
 *
 * @param {object} inputs - All user inputs
 * @returns {Array} Array of year objects with all calculated fields
 */
export function runProjection(inputs) {
  const {
    currentAge,
    retireAge,
    spouseAge,
    filing,
    monthlyPension,
    spousePension,
    tspTraditional,
    spouseTspTraditional = 0,
    tspRoth,
    spouseTspRoth = 0,
    ssPIA,
    ssClaimAge,
    spouseSsPIA,
    spouseSsClaimAge,
    homeValue = 0,
    homeCostBasis = 0,
    homeSaleAge = 0,
    investmentIncome,
    peruPropertyCost = 0,
    peruPropertyAge = 0,
    peruRentalIncome = 0,
    monthlySpending,
    annualTravelBudget = 0,
    selectedState,
    conversionStrategy,
    healthInsuranceCost,
    inflationRate,
    // Legacy fields for URL backwards compatibility
    homeSaleGain,
    homeSaleYear,
  } = inputs;

  const conversionTarget = conversionStrategy === "fill12" ? 0.12 : conversionStrategy === "fill22" ? 0.22 : 0;

  const annualPension = (monthlyPension + spousePension) * 12;
  const primarySS = calcSSBenefit(ssPIA * 12, ssClaimAge);
  const spouseSS = spouseSsPIA > 0 ? calcSSBenefit(spouseSsPIA * 12, spouseSsClaimAge) : 0;
  const brackets = filing === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;

  // ─── Home sale pre-calculation ─────────────────────────────────
  // Calculate taxable gain and net proceeds from home value/basis
  let homeSaleGainAmount = 0;
  let homeSaleNetProceeds = 0;
  const effectiveHomeSaleAge = homeValue > 0 ? homeSaleAge : homeSaleYear || 0;

  if (homeValue > 0) {
    const gain = Math.max(0, homeValue - homeCostBasis);
    const exclusion = filing === "mfj" ? HOME_SALE_EXCLUSION.mfj : HOME_SALE_EXCLUSION.single;
    homeSaleGainAmount = Math.max(0, gain - exclusion);
    const sellingCosts = homeValue * HOME_SELLING_COST_RATE;
    homeSaleNetProceeds = homeValue - sellingCosts;
  } else if (homeSaleGain > 0) {
    // Legacy: direct gain input (for old shared URLs)
    homeSaleGainAmount = homeSaleGain;
    homeSaleNetProceeds = homeSaleGain; // best approximation
  }

  const years = [];
  let tradBal = tspTraditional + spouseTspTraditional;
  let rothBal = tspRoth + spouseTspRoth;
  let cashBal = 0;

  // ─── Pre-retirement events ─────────────────────────────────
  // If the home sale or Peru purchase happens before retirement,
  // apply the cash flow to the starting balance.
  if (homeValue > 0 && effectiveHomeSaleAge < retireAge) {
    cashBal += homeSaleNetProceeds;
  }
  if (peruPropertyCost > 0 && peruPropertyAge > 0 && peruPropertyAge < retireAge) {
    cashBal = Math.max(0, cashBal - peruPropertyCost);
  }

  for (let age = retireAge; age <= MAX_PROJECTION_AGE; age++) {
    const spAge = spouseAge + (age - currentAge);
    const ss = age >= ssClaimAge ? primarySS : 0;
    const spSS = age >= spouseSsClaimAge ? spouseSS : 0;
    const totalSS = ss + spSS;
    const rmd = calcRMD(age, tradBal);

    // ─── Home sale in this year ──────────────────────────────────
    const isHomeSaleYear = age === effectiveHomeSaleAge && (homeValue > 0 || homeSaleGain > 0);
    const homeSaleTaxableGain = isHomeSaleYear ? homeSaleGainAmount : 0;
    const homeSaleProceeds = isHomeSaleYear ? homeSaleNetProceeds : 0;

    // ─── Peru property purchase ──────────────────────────────────
    const peruPurchase = peruPropertyCost > 0 && age === peruPropertyAge ? peruPropertyCost : 0;

    // ─── Cash earnings (interest/investment income on home sale savings) ──
    // This is what a HYSA or investment account generates each year.
    // Visible as potential discretionary income (travel, etc.).
    const cashEarnings = Math.round(cashBal * ANNUAL_GROWTH_RATE);

    // ─── Health insurance cost ──────────────────────────────────
    // Each spouse transitions to Medicare at their own age 65
    const primaryMedicare = age >= MEDICARE_START_AGE;
    const spouseMedicare = spouseAge + (age - currentAge) >= MEDICARE_START_AGE;

    let annualHealthCost;
    if (primaryMedicare && spouseMedicare) {
      // Both on Medicare
      annualHealthCost = MEDICARE_MONTHLY_COST * 12 * (filing === "mfj" ? 2 : 1);
    } else if (primaryMedicare || spouseMedicare) {
      // One on Medicare, one on private insurance
      annualHealthCost = MEDICARE_MONTHLY_COST * 12 + healthInsuranceCost * 12;
    } else {
      // Both on private insurance
      annualHealthCost = healthInsuranceCost * 12;
    }

    // ─── Expenses with inflation ────────────────────────────
    const yearsFromRetirement = age - retireAge;
    const inflatedSpending = monthlySpending * 12 * Math.pow(1 + inflationRate, yearsFromRetirement);
    const inflatedTravel = annualTravelBudget * Math.pow(1 + inflationRate, yearsFromRetirement);
    const totalExpenses = inflatedSpending + inflatedTravel + annualHealthCost;

    // ─── Roth conversion: fill target bracket ───────────────────
    const stdDed = getStandardDeduction(filing, age, spAge);
    // Include home sale taxable gain in base income for bracket calculation
    // (a big gain year = don't convert, brackets are already filled)
    const baseIncome = annualPension + investmentIncome + homeSaleTaxableGain;
    const baseTaxable = Math.max(0, baseIncome + calcSSTaxable(totalSS, baseIncome, filing) - stdDed);

    let conversionRoom = 0;
    if (conversionTarget > 0 && tradBal > rmd) {
      const targetBracket = brackets.find((b) => b.rate === conversionTarget) || brackets[1];
      conversionRoom = Math.max(0, targetBracket.max - baseTaxable - rmd);
      conversionRoom = Math.min(conversionRoom, tradBal - rmd);
    }

    const rothConversion = conversionStrategy === "none" ? 0 : conversionRoom;
    const traditionalWithdrawal = rmd + rothConversion;

    // ─── Tax calculations ───────────────────────────────────────
    // Separate ordinary income from home sale gain (taxed at LTCG rates)
    const ordinaryIncome = annualPension + traditionalWithdrawal + investmentIncome;
    // Home sale gain still counts toward provisional income for SS taxation
    const ssTaxable = calcSSTaxable(totalSS, ordinaryIncome + homeSaleTaxableGain, filing);
    const agi = ordinaryIncome + homeSaleTaxableGain + ssTaxable;
    const ordinaryTaxable = Math.max(0, ordinaryIncome + ssTaxable - stdDed);
    const ordinaryFedTax = calcFederalTax(ordinaryTaxable, filing);
    const homeSaleTax = calcCapitalGainsTax(homeSaleTaxableGain, ordinaryTaxable, filing);
    const federalTax = ordinaryFedTax + homeSaleTax;
    const taxWithoutConversion =
      rothConversion > 0 ? calcFederalTax(Math.max(0, ordinaryTaxable - rothConversion), filing) : federalTax;
    const conversionTaxCost = federalTax - taxWithoutConversion;
    const taxableIncome = ordinaryTaxable; // used for marginal rate lookup
    const marginalRate = getMarginalRate(taxableIncome, filing);
    const irmaaAge = age - 2;
    const irmaaYearData = years.find((y) => y.age === irmaaAge);
    const irmaaIncome = irmaaYearData ? irmaaYearData.agi : agi;
    const irmaa = age >= 65 ? calcIRMAA(irmaaIncome, filing) : 0;
    const stateTax = calcStateTax(
      selectedState,
      annualPension,
      totalSS,
      rmd,
      investmentIncome + homeSaleTaxableGain,
      age,
    );

    // ─── Cover living expenses from income + savings ─────────────
    // Spendable income EXCLUDES home sale gain (those proceeds go to cashBal).
    // The home sale TAX still comes out of income, which increases the shortfall
    // drawn from cash — correctly modeling the tax cost against the proceeds.
    const spendableGrossIncome = annualPension + totalSS + traditionalWithdrawal + investmentIncome;
    const afterTaxIncome = spendableGrossIncome - federalTax - stateTax - irmaa;

    // Draw order: cash first (already-taxed), then Roth (tax-free growth)
    const shortfall = Math.max(0, totalExpenses - afterTaxIncome);
    const cashWithdrawal = Math.min(shortfall, cashBal);
    const rothNeeded = shortfall - cashWithdrawal;
    const rothWithdrawal = Math.min(rothNeeded, rothBal);

    const savingsDepleted = tradBal <= 0 && rothBal <= 0 && cashBal <= 0;
    const netMonthlyIncome = savingsDepleted
      ? (afterTaxIncome - totalExpenses) / 12
      : (afterTaxIncome + cashWithdrawal + rothWithdrawal - totalExpenses) / 12;

    // ─── Update balances ────────────────────────────────────────
    // Home sale proceeds enter cash balance; Peru purchase deducted
    cashBal = Math.max(0, (cashBal + homeSaleProceeds - peruPurchase - cashWithdrawal) * (1 + ANNUAL_GROWTH_RATE));
    tradBal = Math.max(0, (tradBal - traditionalWithdrawal) * (1 + ANNUAL_GROWTH_RATE));
    rothBal = Math.max(0, (rothBal - rothWithdrawal + rothConversion) * (1 + ANNUAL_GROWTH_RATE));

    const totalTax = federalTax + stateTax + irmaa;

    // For display: totalGrossIncome includes everything for AGI/informational purposes
    const totalGrossIncome = annualPension + totalSS + traditionalWithdrawal + investmentIncome + homeSaleTaxableGain;

    years.push({
      age,
      annualPension,
      ss,
      spouseSS: spSS,
      totalSS,
      ssTaxable,
      rmd,
      rothConversion,
      traditionalWithdrawal,
      rothWithdrawal,
      cashWithdrawal,
      investmentIncome,
      homeSaleTaxableGain,
      homeSaleProceeds,
      peruPurchase,
      totalGrossIncome,
      agi,
      taxableIncome,
      federalTax,
      stateTax,
      irmaa,
      totalTax,
      effectiveRate: agi > 0 ? totalTax / agi : 0,
      marginalRate,
      tradBal,
      rothBal,
      cashBal,
      standardDeduction: stdDed,
      conversionRoom,
      conversionTaxCost,
      annualHealthCost,
      totalExpenses,
      netMonthlyIncome,
      savingsDepleted,
      inflatedSpending,
      inflatedTravel,
      cashEarnings,
      peruRentalIncome,
    });
  }

  return years;
}

/**
 * Compute summary statistics from a projection.
 */
export function summarizeProjection(projection, inputs) {
  const totalFederalTax = projection.reduce((s, y) => s + y.federalTax, 0);
  const totalStateTax = projection.reduce((s, y) => s + y.stateTax, 0);
  const totalIRMAA = projection.reduce((s, y) => s + y.irmaa, 0);
  const totalConversions = projection.reduce((s, y) => s + y.rothConversion, 0);
  const avgEffectiveRate = projection.reduce((s, y) => s + y.effectiveRate, 0) / projection.length;

  const depletionYear = projection.find((y) => y.savingsDepleted);
  const depletionAge = depletionYear ? depletionYear.age : null;

  const retirementYear = projection[0];
  const retirementMonthlyIncome = retirementYear ? retirementYear.netMonthlyIncome : 0;

  const totalHealthInsuranceCost = projection.filter((y) => y.age < 65).reduce((s, y) => s + y.annualHealthCost, 0);

  // Tax savings vs no-conversion baseline
  const baselineProjection = runProjection({ ...inputs, conversionStrategy: "none" });
  const baselineTax = baselineProjection.reduce((s, y) => s + y.totalTax, 0);
  const optimizedTax = projection.reduce((s, y) => s + y.totalTax, 0);
  const taxSavingsVsBaseline = Math.max(0, baselineTax - optimizedTax);

  // Baseline depletion for comparison
  const baselineDepletion = baselineProjection.find((y) => y.savingsDepleted);
  const baselineDepletionAge = baselineDepletion ? baselineDepletion.age : null;

  return {
    totalFederalTax,
    totalStateTax,
    totalIRMAA,
    totalConversions,
    avgEffectiveRate,
    totalAllTax: totalFederalTax + totalStateTax + totalIRMAA,
    depletionAge,
    baselineDepletionAge,
    retirementMonthlyIncome,
    totalHealthInsuranceCost,
    taxSavingsVsBaseline,
  };
}

/**
 * Binary search for the maximum monthly spending that depletes all
 * savings right around the target end age.
 *
 * Returns { maxMonthlySpending, depletionAge } — the highest spending
 * level where money runs out within 1 year of the target.
 */
export function solveSpendDown(inputs) {
  const { targetEndAge = 90, retireAge } = inputs;
  if (!targetEndAge || targetEndAge <= retireAge) return null;

  let lo = 0;
  let hi = 30000; // $30K/mo ceiling
  let bestSpending = 0;
  let bestDepletion = null;

  // 20 iterations of binary search = precision within ~$1/mo
  for (let i = 0; i < 20; i++) {
    const mid = Math.round((lo + hi) / 2);
    const proj = runProjection({ ...inputs, monthlySpending: mid });
    const depleted = proj.find((y) => y.savingsDepleted);
    const depAge = depleted ? depleted.age : null;

    if (depAge === null || depAge > targetEndAge) {
      // Money lasts too long — can spend more
      lo = mid;
      bestSpending = mid;
      bestDepletion = depAge;
    } else if (depAge <= targetEndAge) {
      // Runs out too soon — spend less
      hi = mid;
      bestSpending = mid;
      bestDepletion = depAge;
    }
  }

  return {
    maxMonthlySpending: bestSpending,
    depletionAge: bestDepletion,
  };
}
