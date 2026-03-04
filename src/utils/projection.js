import { BRACKETS_SINGLE, BRACKETS_MFJ, ANNUAL_GROWTH_RATE, MAX_PROJECTION_AGE } from "../constants";
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
 * home sale gains, federal/state taxes, IRMAA, and account balance growth.
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
    pension,
    tspTraditional,
    tspRoth,
    ssPIA,
    ssClaimAge,
    homeSaleGain,
    homeSaleYear,
    investmentIncome,
    livingExpenses,
    selectedState,
    conversionStrategy,
  } = inputs;

  const conversionTarget = conversionStrategy === "fill12" ? 0.12 : conversionStrategy === "fill22" ? 0.22 : 0;

  const annualSS = calcSSBenefit(ssPIA * 12, ssClaimAge);
  const brackets = filing === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;

  const years = [];
  let tradBal = tspTraditional;
  let rothBal = tspRoth;

  for (let age = retireAge; age <= MAX_PROJECTION_AGE; age++) {
    const spAge = spouseAge + (age - currentAge);
    const ss = age >= ssClaimAge ? annualSS : 0;
    const homeSale = age === homeSaleYear ? homeSaleGain : 0;
    const rmd = calcRMD(age, tradBal);

    // ─── Roth conversion: fill target bracket ───────────────────
    const stdDed = getStandardDeduction(filing, age, spAge);
    const baseIncome = pension + investmentIncome + homeSale;
    const baseTaxable = Math.max(0, baseIncome + calcSSTaxable(ss, baseIncome, filing) - stdDed);

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
    const ordinaryIncome = pension + traditionalWithdrawal + investmentIncome;
    // Home sale gain still counts toward provisional income for SS taxation
    const ssTaxable = calcSSTaxable(ss, ordinaryIncome + homeSale, filing);
    const agi = ordinaryIncome + homeSale + ssTaxable;
    const ordinaryTaxable = Math.max(0, ordinaryIncome + ssTaxable - stdDed);
    const ordinaryFedTax = calcFederalTax(ordinaryTaxable, filing);
    const homeSaleTax = calcCapitalGainsTax(homeSale, ordinaryTaxable, filing);
    const federalTax = ordinaryFedTax + homeSaleTax;
    const taxWithoutConversion = rothConversion > 0
      ? calcFederalTax(Math.max(0, ordinaryTaxable - rothConversion), filing)
      : federalTax;
    const conversionTaxCost = federalTax - taxWithoutConversion;
    const taxableIncome = ordinaryTaxable; // used for marginal rate lookup
    const marginalRate = getMarginalRate(taxableIncome, filing);
    const irmaaAge = age - 2;
    const irmaaYearData = years.find(y => y.age === irmaaAge);
    const irmaaIncome = irmaaYearData ? irmaaYearData.agi : agi;
    const irmaa = age >= 65 ? calcIRMAA(irmaaIncome, filing) : 0;
    const stateTax = calcStateTax(selectedState, pension, ss, rmd, investmentIncome + homeSale, age);

    // ─── Roth withdrawal to cover living expenses ───────────────
    const afterTaxFromOtherSources = pension + ss + rmd + investmentIncome - federalTax - stateTax - irmaa;
    const rothWithdrawal = Math.max(0, livingExpenses - afterTaxFromOtherSources);

    // ─── Update balances ────────────────────────────────────────
    tradBal = Math.max(0, (tradBal - traditionalWithdrawal) * (1 + ANNUAL_GROWTH_RATE));
    rothBal = Math.max(0, (rothBal - rothWithdrawal + rothConversion) * (1 + ANNUAL_GROWTH_RATE));

    const totalTax = federalTax + stateTax + irmaa;

    years.push({
      age,
      pension,
      ss,
      ssTaxable,
      rmd,
      rothConversion,
      traditionalWithdrawal,
      rothWithdrawal,
      investmentIncome,
      homeSale,
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
      standardDeduction: stdDed,
      conversionRoom,
      conversionTaxCost,
    });
  }

  return years;
}

/**
 * Compute summary statistics from a projection.
 */
export function summarizeProjection(projection) {
  const totalFederalTax = projection.reduce((s, y) => s + y.federalTax, 0);
  const totalStateTax = projection.reduce((s, y) => s + y.stateTax, 0);
  const totalIRMAA = projection.reduce((s, y) => s + y.irmaa, 0);
  const totalConversions = projection.reduce((s, y) => s + y.rothConversion, 0);
  const avgEffectiveRate = projection.reduce((s, y) => s + y.effectiveRate, 0) / projection.length;

  return {
    totalFederalTax,
    totalStateTax,
    totalIRMAA,
    totalConversions,
    avgEffectiveRate,
    totalAllTax: totalFederalTax + totalStateTax + totalIRMAA,
  };
}
