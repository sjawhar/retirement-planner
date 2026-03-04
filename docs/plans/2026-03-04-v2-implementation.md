# Retirement Planner v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the federal retirement planner from a tax optimization tool to a retirement readiness tool that answers "when can I retire and what will I have to live on?"

**Architecture:** Keep the Vite + React + Recharts stack. The core projection engine (`src/utils/projection.js`) gets expanded to model two spouses, health insurance, inflation, and correct tax math. The UI gets restructured around new summary cards and reframed tabs. Constants are extended with health insurance data and capital gains brackets.

**Tech Stack:** React 18, Recharts, Vite, Playwright (E2E tests)

**Design doc:** `docs/plans/2026-03-04-v2-redesign-design.md`

**Note on Phase 1 vs Phase 3:** Phase 1 fixes bugs in the current projection
code. Phase 3 expands that code with new features. The Phase 1 fixes establish
correct patterns (incremental tax cost, IRMAA lookback) that Phase 3 preserves
and builds on — they're not thrown away.

---

## Phase 1: Fix Math Bugs (no UI changes)

Fix the calculation errors before building new features. Each fix is
independently testable and keeps the existing UI working.

### Task 1: Fix Roth conversion tax cost calculation

**Files:**

- Modify: `src/utils/projection.js` (add incremental tax field)
- Modify: `src/components/tabs/RothTab.jsx:110` (use new field)

**Step 1: Add incremental tax cost to projection output**

In `src/utils/projection.js`, the projection loop already calculates
`federalTax` on total taxable income. Add a new field `conversionTaxCost`
that computes the actual incremental cost:

```js
// After existing federalTax calculation
const taxWithoutConversion =
  rothConversion > 0 ? calcFederalTax(Math.max(0, agi - rothConversion - stdDed), filing) : federalTax;
const conversionTaxCost = federalTax - taxWithoutConversion;
```

Add `conversionTaxCost` to the year object pushed to `years`.

**Step 2: Update RothTab to use correct cost**

In `src/components/tabs/RothTab.jsx`, line 110, replace:

```jsx
{
  fmt(y.rothConversion * y.marginalRate);
}
```

with:

```jsx
{
  fmt(y.conversionTaxCost);
}
```

**Step 3: Run tests, verify they pass**

Run: `npm test`

**Step 4: Commit**

```
jj describe -m "fix: use incremental tax for Roth conversion cost"
jj new
```

### Task 2: Fix state comparison hardcoded withdrawal

**Files:**

- Modify: `src/App.jsx` (pass projection to StateTab)
- Modify: `src/components/tabs/StateTab.jsx` (accept and use projection prop)

**Step 1: Pass projection data to StateTab**

In `src/App.jsx`, change StateTab rendering to also pass `projection`:

```jsx
{
  tab === "states" && <StateTab state={inputs} projection={projection} />;
}
```

**Step 2: Use actual withdrawal amounts in StateTab**

In `StateTab.jsx`, accept `projection` as a prop. Replace the hardcoded loop:

```js
return states.map((st) => {
  let total = 0;
  for (const year of projection) {
    total += calcStateTax(
      st,
      year.pension,
      year.ss,
      year.traditionalWithdrawal,
      year.investmentIncome + year.homeSale,
      year.age,
    );
  }
  const years = projection.length;
  return {
    state: st,
    avgAnnual: Math.round(total / years),
    total: Math.round(total),
    profile: STATE_TAX_PROFILES[st],
  };
});
```

Remove unused destructured props (`retireAge`, `ssPIA`, `ssClaimAge`,
`investmentIncome`).

**Step 3: Run tests, verify they pass**

Run: `npm test`

**Step 4: Commit**

```
jj describe -m "fix: use actual projected withdrawals in state comparison"
jj new
```

### Task 3: Fix IRMAA 2-year lookback

**Files:**

- Modify: `src/utils/projection.js`

**Step 1: Store AGI history and use 2-year lookback**

In the projection loop, replace the IRMAA line:

```js
const irmaa = age >= 65 ? calcIRMAA(agi, filing) : 0;
```

with a lookback into the `years` array:

```js
const irmaaAge = age - 2;
const irmaaYearData = years.find((y) => y.age === irmaaAge);
const irmaaIncome = irmaaYearData ? irmaaYearData.agi : agi;
const irmaa = age >= 65 ? calcIRMAA(irmaaIncome, filing) : 0;
```

**Step 2: Run tests, verify they pass**

Run: `npm test`

**Step 3: Commit**

```
jj describe -m "fix: use 2-year AGI lookback for IRMAA calculation"
jj new
```

### Task 4: Add capital gains tax rates for home sale

**Files:**

- Modify: `src/constants/federalTax.js` (add LTCG brackets)
- Modify: `src/constants/index.js` (export new constants)
- Modify: `src/utils/federalTax.js` (add `calcCapitalGainsTax` function)
- Modify: `src/utils/index.js` (export new function)
- Modify: `src/utils/projection.js` (use LTCG rates for home sale gain)

**Step 1: Add LTCG rate brackets to constants**

In `src/constants/federalTax.js`:

```js
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
```

**Step 2: Add calcCapitalGainsTax utility**

In `src/utils/federalTax.js`:

```js
export function calcCapitalGainsTax(gain, ordinaryTaxableIncome, filing) {
  if (gain <= 0) return 0;
  const brackets = filing === "mfj" ? LTCG_BRACKETS_MFJ : LTCG_BRACKETS_SINGLE;
  // Capital gains stack on top of ordinary income
  const base = ordinaryTaxableIncome;
  let tax = 0;
  let remaining = gain;

  for (const bracket of brackets) {
    if (base >= bracket.max) continue;
    const room =
      bracket.max - Math.max(base, bracket === brackets[0] ? 0 : brackets[brackets.indexOf(bracket) - 1].max);
    const taxable = Math.min(remaining, Math.max(0, bracket.max - Math.max(base, 0)));
    tax += taxable * bracket.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }

  return tax;
}
```

**Step 3: Update projection to use LTCG rates for home sale**

In `src/utils/projection.js`, instead of adding `homeSale` to ordinary income
for federal tax, calculate home sale tax separately:

```js
const ordinaryIncome = pension + traditionalWithdrawal + investmentIncome;
const ssTaxable = calcSSTaxable(ss, ordinaryIncome + homeSale, filing);
const ordinaryAGI = ordinaryIncome + ssTaxable;
const ordinaryTaxable = Math.max(0, ordinaryAGI - stdDed);
const ordinaryFedTax = calcFederalTax(ordinaryTaxable, filing);
const homeSaleTax = calcCapitalGainsTax(homeSale, ordinaryTaxable, filing);
const federalTax = ordinaryFedTax + homeSaleTax;
```

Note: home sale gain still counts toward provisional income for SS taxation
(this is correct — gains affect SS taxability even though they're taxed at
LTCG rates).

**Step 4: Run tests, verify they pass**

Run: `npm test`

**Step 5: Commit**

```
jj describe -m "fix: tax home sale gains at LTCG rates instead of ordinary income"
jj new
```

---

## Phase 2: Expand Inputs for Spouse and Health Insurance

### Task 5: Add new defaults, rename pension to monthly

**Files:**

- Modify: `src/constants/defaults.js`

**Step 1: Add spouse and health insurance defaults**

```js
export const DEFAULTS = {
  currentAge: 57,
  retireAge: 60,
  spouseAge: 56,
  filing: "mfj",
  monthlyPension: 850, // renamed from pension, now monthly
  spousePension: 800, // monthly
  tspTraditional: 600000,
  tspRoth: 100000,
  ssPIA: 2400,
  ssClaimAge: 67,
  spouseSsPIA: 0, // monthly PIA
  spouseSsClaimAge: 67,
  homeSaleGain: 0,
  homeSaleYear: 62,
  investmentIncome: 5000,
  monthlySpending: 5000, // renamed from livingExpenses, now monthly
  selectedState: "Utah", // changed from Virginia
  conversionStrategy: "fill12",
  healthInsurance: "fehb",
  healthInsuranceCost: 800, // monthly
  inflationRate: 0.025,
};
```

Update PARAM_MAP with new/renamed keys. Update NUMERIC_FIELDS.

**Step 2: Update all references to `pension` → `monthlyPension`**

Search and replace across:

- `src/utils/projection.js`
- `src/components/Sidebar.jsx`
- `src/components/tabs/StateTab.jsx`

And `livingExpenses` → `monthlySpending`.

**Step 3: Update Playwright tests for new defaults**

Update `tests/app.spec.js`:

- Default state is now "Utah" (was "Virginia")
- Pension slider has different range
- New slider count (more inputs)
- Summary card text will change in later tasks — for now just fix the
  defaults-related assertions so tests pass with the renamed fields.

**Step 4: Run tests, fix any remaining failures**

Run: `npm test`

**Step 5: Commit**

```
jj describe -m "feat: rename inputs to monthly, add spouse/health defaults, set Utah default"
jj new
```

### Task 6: Add health insurance constants

**Files:**

- Create: `src/constants/healthInsurance.js`
- Modify: `src/constants/index.js`

**Step 1: Create health insurance constants**

```js
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

export const MEDICARE_START_AGE = 65;
export const MEDICARE_MONTHLY_COST = 400;
```

**Step 2: Export from constants/index.js**

**Step 3: Commit**

```
jj describe -m "feat: add health insurance constants"
jj new
```

### Task 7: Add spouse and insurance sections to sidebar

**Files:**

- Modify: `src/components/Sidebar.jsx`

**Step 1: Add "Spouse's Income" section**

- Spouse's Monthly Pension (slider, $0–$5,000, step $50)
- Spouse's SS Estimate (monthly PIA) (slider, $0–$4,800, step $50)
- Spouse's SS Claim Age (slider, 62–70)

**Step 2: Reframe existing inputs**

- "FERS Pension (annual)" → "Your Monthly Pension" (range $0–$5,000, step $50)
- "Annual Living Expenses" → "Monthly Spending" (range $2,000–$15,000, step $100)

**Step 3: Add "Expenses & Insurance" section**

- Health Insurance dropdown (FEHB / ACA Marketplace / Employer / None)
- Monthly Insurance Cost (slider, $0–$3,000, step $50)
- Inflation Rate (slider, 0%–5%, step 0.5%)

**Step 4: Update tests for new sidebar structure**

Update `tests/app.spec.js` sidebar tests:

- New section titles ("Spouse's Income", "Expenses & Insurance")
- Updated slider count
- New select count (health insurance dropdown)

**Step 5: Run tests**

Run: `npm test`

**Step 6: Commit**

```
jj describe -m "feat: add spouse income, health insurance, and inflation to sidebar"
jj new
```

---

## Phase 3: Expand the Projection Engine

Split into focused tasks. Each adds one concern to the projection loop.

### Task 8: Add spouse income to projection

**Files:**

- Modify: `src/utils/projection.js`

**Step 1: Add spouse pension and SS to the projection loop**

Update `runProjection` to destructure new inputs (`monthlyPension`,
`spousePension`, `spouseSsPIA`, `spouseSsClaimAge`).

```js
const annualPension = (monthlyPension + spousePension) * 12;
const primarySS = calcSSBenefit(ssPIA * 12, ssClaimAge);
const spouseSS = spouseSsPIA > 0 ? calcSSBenefit(spouseSsPIA * 12, spouseSsClaimAge) : 0;

// Inside loop:
const ss = age >= ssClaimAge ? primarySS : 0;
const spSS = age >= spouseSsClaimAge ? spouseSS : 0;
const totalSS = ss + spSS;
```

Replace all uses of `pension` (the old annual value) with `annualPension`.
Replace `ss` in tax calculations with `totalSS`.

Add `spouseSS`, `totalSS`, `annualPension` to year output.

**Step 2: Update `livingExpenses` references to `monthlySpending`**

The projection now uses `monthlySpending * 12` for annual spending.

**Step 3: Run tests**

Run: `npm test`

**Step 4: Commit**

```
jj describe -m "feat: add spouse pension and SS to projection engine"
jj new
```

### Task 9: Add health insurance to projection

**Files:**

- Modify: `src/utils/projection.js`

**Step 1: Model health insurance as an expense**

```js
// Per-spouse Medicare timing
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
```

Add `annualHealthCost` to expense calculations and to year output.

**Step 2: Run tests**

Run: `npm test`

**Step 3: Commit**

```
jj describe -m "feat: add per-spouse health insurance to projection"
jj new
```

### Task 10: Add inflation and depletion detection

**Files:**

- Modify: `src/utils/projection.js`

**Step 1: Apply inflation to spending**

```js
const yearsFromRetirement = age - retireAge;
const inflatedSpending = monthlySpending * 12 * Math.pow(1 + inflationRate, yearsFromRetirement);
const totalExpenses = inflatedSpending + annualHealthCost;
```

**Step 2: Calculate net monthly income and detect depletion**

```js
const totalGrossIncome = annualPension + totalSS + traditionalWithdrawal + investmentIncome + homeSale;
const afterTaxIncome = totalGrossIncome - federalTax - stateTax - irmaa;
const rothNeeded = Math.max(0, totalExpenses - afterTaxIncome);
const rothWithdrawal = Math.min(rothNeeded, rothBal);

const savingsDepleted = tradBal <= 0 && rothBal <= 0;
const netMonthlyIncome = savingsDepleted
  ? (afterTaxIncome - totalExpenses) / 12
  : (afterTaxIncome + rothWithdrawal - totalExpenses) / 12;
```

Add `totalExpenses`, `netMonthlyIncome`, `savingsDepleted`, `inflatedSpending`
to year output.

**Step 3: Update summarizeProjection**

Add:

- `depletionAge`: first year where `savingsDepleted` is true (or null)
- `retirementMonthlyIncome`: `netMonthlyIncome` at retirement age
- `totalHealthInsuranceCost`: sum of `annualHealthCost` from retirement to 65
- `taxSavingsVsBaseline`: run a second projection with
  `conversionStrategy: "none"` and diff the total tax

**Step 4: Run tests**

Run: `npm test`

**Step 5: Commit**

```
jj describe -m "feat: add inflation, depletion detection, net monthly income"
jj new
```

---

## Phase 4: Update the UI

### Task 11: Update summary cards

**Files:**

- Modify: `src/App.jsx`

**Step 1: Replace summary cards**

```jsx
<Card
  title="Savings Last To"
  value={summary.depletionAge ? `Age ${summary.depletionAge}` : "92+"}
  subtitle={summary.depletionAge ? "Consider delaying retirement" : "You're covered"}
  color={summary.depletionAge && summary.depletionAge < 85 ? "#dc2626" : "#22c55e"}
/>
<Card
  title="Monthly Income"
  value={fmt(summary.retirementMonthlyIncome)}
  subtitle={`At age ${inputs.retireAge}, after taxes`}
/>
<Card
  title="Health Insurance"
  value={fmt(summary.totalHealthInsuranceCost)}
  subtitle={`Ages ${inputs.retireAge}–65`}
  color="#7c3aed"
/>
<Card
  title="Tax Optimization Saves"
  value={fmt(summary.taxSavingsVsBaseline)}
  subtitle={inputs.conversionStrategy === "none"
    ? "Enable Roth strategy"
    : `Via ${inputs.conversionStrategy === "fill12" ? "12%" : "22%"} fill`}
  color="#d97706"
/>
```

**Step 2: Update tests for new summary cards**

Update card assertions in `tests/app.spec.js`:

- "Savings Last To" replaces "Lifetime Fed Tax"
- "Monthly Income" replaces "Lifetime State Tax"
- "Health Insurance" replaces "Avg Effective Rate"
- "Tax Optimization Saves" replaces "Total Roth Conversions"

**Step 3: Run tests**

Run: `npm test`

**Step 4: Commit**

```
jj describe -m "feat: replace summary cards with retirement readiness metrics"
jj new
```

### Task 12: Rebuild Retirement Timeline tab

**Files:**

- Modify: `src/components/tabs/YearPlanTab.jsx`

**Step 1: Replace Tax Burden chart with Income vs Expenses**

Stacked area chart with:

- Stacked areas: pension, SS, TSP withdrawal, Roth withdrawal
- Line overlay: total expenses
- Vertical reference lines at key ages: SS claim age, Medicare (65), RMD (73)

**Step 2: Update Account Balances chart**

Add "depletion" marker if savings run out. Add total net worth line.

**Step 3: Update detail table**

Add columns: Health Insurance, Spouse SS, Net Monthly Income.
Remove: Marginal Rate, Conversion Room.

**Step 4: Update tests for new tab content**

Update assertions for chart titles and table columns.

**Step 5: Run tests**

Run: `npm test`

**Step 6: Commit**

```
jj describe -m "feat: rebuild timeline tab with income vs expenses focus"
jj new
```

### Task 13: Update Withdrawal Strategy tab

**Files:**

- Modify: `src/components/tabs/RothTab.jsx`

**Step 1: Reframe strategy explanation in plain language**

```
"By converting $X from your traditional savings to Roth over ages Y–Z,
you'll save $X in lifetime taxes and your savings will last N years longer."
```

**Step 2: Add comparison view**

Side-by-side cards: "Without optimization" vs "With Roth conversions" showing
lifetime tax, depletion age, monthly income.

**Step 3: Update tests**

Update Roth tab test assertions.

**Step 4: Run tests**

Run: `npm test`

**Step 5: Commit**

```
jj describe -m "feat: reframe withdrawal strategy with plain language and comparison"
jj new
```

### Task 14: Simplify Where to Retire tab

**Files:**

- Modify: `src/constants/stateTax.js`
- Modify: `src/components/tabs/StateTab.jsx`

**Step 1: Add Utah state profile**

```js
Utah: {
  rate: 0.0465,
  pensionExempt: false,
  ssExempt: false,
  tspExempt: false,
  label: "Flat 4.65%; taxes all retirement income including SS",
  residencyNotes: "Taxes Social Security. Consider establishing residency elsewhere.",
},
```

**Step 2: Update default comparison states**

```js
export const DEFAULT_COMPARE_STATES = ["Florida", "Texas", "Nevada", "Wyoming", "Tennessee", "Pennsylvania"];
```

**Step 3: Add residency notes to relevant state profiles**

Add `residencyNotes` to FL, TX, NV, WY, TN, PA with practical info for
part-time residents.

**Step 4: Show residency notes in state cards**

**Step 5: Update tests**

Update state tab test assertions for new comparison set and Utah default.

**Step 6: Run tests**

Run: `npm test`

**Step 7: Commit**

```
jj describe -m "feat: add Utah, simplify state comparison for part-time residency"
jj new
```

### Task 15: Add spouse SS to SS Timing tab

**Files:**

- Modify: `src/components/tabs/SSTab.jsx`
- Modify: `src/App.jsx` (pass spouse SS props)

**Step 1: Pass spouse props to SSTab**

**Step 2: Show combined household benefit section**

Add a "Combined Household" section below the primary earner's cards showing
total monthly SS at each claiming combination.

**Step 3: Update tests**

Update SS tab assertions.

**Step 4: Run tests**

Run: `npm test`

**Step 5: Commit**

```
jj describe -m "feat: add spouse SS to timing tab"
jj new
```

---

## Phase 5: Documentation

### Task 16: Update README for v2

**Files:**

- Modify: `README.md`

Update:

- Feature descriptions (retirement readiness framing)
- URL parameter table (new/renamed params)
- Project structure (new files: healthInsurance.js)
- Annual update instructions (health insurance constants)

**Step 1: Rewrite README**

**Step 2: Run full test suite one final time**

Run: `npm test`

**Step 3: Commit**

```
jj describe -m "docs: update README for v2"
jj new
```

---

## Execution Order Summary

| Phase | Tasks | What it does                                                                  |
| ----- | ----- | ----------------------------------------------------------------------------- |
| 1     | 1–4   | Fix math bugs: Roth tax cost, state comparison, IRMAA lookback, capital gains |
| 2     | 5–7   | New defaults, health insurance constants, sidebar expansion                   |
| 3     | 8–10  | Projection engine: spouse income, health insurance, inflation + depletion     |
| 4     | 11–15 | UI: summary cards, all 4 tabs updated with tests inline                       |
| 5     | 16    | README                                                                        |

Each task includes its own test updates — no batched test task at the end.
Each task is independently committable.
The app should remain functional between tasks.
