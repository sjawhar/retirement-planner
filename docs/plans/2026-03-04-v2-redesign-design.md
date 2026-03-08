# Federal Retirement Planner v2 — Design Document

**Date:** 2026-03-04
**Status:** Approved

## Context

This app was built for a specific person: a federal employee (FERS) at the VA,
turning 57, married, with a combined household pension of ~$1,650/month. She owns
a home in Utah (~$750K), two properties in Peru, and wants to split time between
the US and South America. She wants to retire as soon as possible and needs to
know what she'll have to live on.

The v1 app was generated from a Claude conversation and framed as a tax
optimization tool. It answers "how do I minimize taxes on my retirement income?"
But the actual question is "when can I retire, and what will I have to live on?"
Tax optimization is part of the answer, not the question itself.

## Core Principles

1. **Answer "when can I retire and what will I have to live on."** This is the
   primary question. Every feature serves this. If a feature doesn't help answer
   this question, it doesn't belong.

2. **Model both spouses.** Two pensions, two SS estimates, two ages, shared
   expenses. Retirement planning for a married couple is fundamentally different
   from single-person planning.

3. **Include real costs the current app ignores.** Health insurance from
   retirement to Medicare (age 65) is the biggest gap. For someone retiring at
   57, that's 8 years of coverage to pay for. This cost can be $8,000–$20,000/year
   and interacts with income-based ACA subsidies.

4. **Show money running out, not just tax bills.** The headline number is
   "savings last to age X" and "monthly income after taxes." Tax burden is
   secondary information that feeds into these primary outputs.

5. **Tax optimization is how you get better answers.** Roth conversions, state
   choice, and SS timing all improve the core numbers. They're not separate
   features — they're strategies that make retirement more affordable.

6. **Get the math right.** The v1 app has calculation bugs that produce
   misleading numbers. Fixing these is not optional.

## What's Wrong with v1

### Framing problems

- Leads with "Lifetime Fed Tax" as the headline metric. A retiree with
  $1,650/month pension doesn't care about lifetime tax first — she cares about
  whether she can afford to retire.
- No spouse modeling. The sidebar has one pension input. In reality, both spouses
  contribute income on different timelines.
- No health insurance. For someone retiring at 57, this is potentially the
  largest expense for 8 years and the app pretends it doesn't exist.
- No "when does money run out" indicator. The projection runs to age 92 and
  shows balances going to zero without flagging it.
- Pension input defaults to $50K/year and uses annual amounts. Real people know
  their pension as a monthly number. The slider range doesn't accommodate low
  pensions well.

### Math bugs

- **Roth conversion tax cost is wrong.** The Roth tab (`RothTab.jsx:110`)
  calculates tax cost as `conversion × marginalRate`. This overstates the cost
  because conversions cross multiple brackets. The correct calculation is the
  incremental federal tax: `tax(income + conversion) - tax(income)`.
- **State comparison uses hardcoded withdrawal.** `StateTab.jsx:17` passes a
  fixed `30000` as the TSP withdrawal for all states instead of using the actual
  projected withdrawal amount. This makes the comparison unreliable.
- **IRMAA ignores the 2-year lookback.** `projection.js:78` applies IRMAA based
  on current-year AGI, but real IRMAA uses income from 2 years prior. A big Roth
  conversion at 63 should show up as higher Medicare premiums at 65.
- **No inflation modeling.** Pension is fixed, expenses are fixed. Over 30+
  years this compounds into major inaccuracy. Even a simple 2-3% annual
  adjustment would help.
- **Home sale gains taxed at ordinary rates.** The projection treats home sale
  gains above the Section 121 exclusion as ordinary income. They should be taxed
  at long-term capital gains rates (0%/15%/20%).

### Missing features

- No FERS Special Retirement Supplement (SRS) — bridge income between retirement
  and age 62 for those who qualify.
- No early withdrawal penalty modeling (10% before 59½, Rule of 55 exception).
- No spousal Social Security benefits.
- No ACA marketplace subsidy interaction with income.
- No Qualified Charitable Distributions (QCDs) at age 70½+.

## Design

### Inputs (Sidebar)

Reorganize into clear sections with friendlier labels:

**Your Household**

- Filing status: MFJ / Single (keep as-is)
- Your age (keep as-is)
- Spouse's age (keep as-is)
- Target retirement age (keep as-is)

**Your Income**

- Your monthly pension → new: monthly, not annual
- Your SS estimate (monthly PIA) → keep
- Your SS claim age → keep

**Spouse's Income**

- Spouse's monthly pension → new
- Spouse's SS estimate (monthly PIA) → new
- Spouse's SS claim age → new

**Assumption:** Both spouses' pensions start at the same retirement age (the
"Target retirement age" input). If the spouse is still working or retires at a
different time, they can adjust by setting the spouse's pension to $0 and
increasing it in a separate scenario. Modeling independent retirement dates is
out of scope for v2.

**Savings**

- TSP/401k Traditional balance → keep
- TSP/401k Roth balance → keep

**Your Home**

- Home value → new (more intuitive than "gain above exclusion")
- Estimated purchase price / basis → new (app calculates gain)
- Plan to sell? Y/N, at what age → replaces current home sale inputs

**Expenses & Insurance**

- Desired monthly spending → replaces "annual living expenses." This is total
  household spending (rent/mortgage, food, travel, utilities, etc.) **excluding**
  health insurance and taxes. The app models those separately and adds them on
  top. This separation lets the user see exactly where their money goes.
- Health insurance: FEHB / ACA Marketplace / Employer (spouse) / Other
- Monthly health insurance cost (if known, otherwise estimate by type)

**Strategy**

- Roth conversion strategy → keep (none / fill 12% / fill 22%)
- State of residence → keep
- Inflation assumption → new (default 2.5%, adjustable)

### Summary Cards

Replace the current four cards:

| Current                | New                                                    |
| ---------------------- | ------------------------------------------------------ |
| Lifetime Fed Tax       | **Savings Last To Age X**                              |
| Lifetime State Tax     | **Monthly After-Tax Income** (at retirement)           |
| Avg Effective Rate     | **Health Insurance Cost** (retirement to 65)           |
| Total Roth Conversions | **Tax Savings from Optimization** (vs. naive strategy) |

The "Tax Savings" card shows the delta between the optimized plan and a
no-conversion, current-state baseline. This connects the optimization work to
a concrete dollar amount.

### Tabs

#### 1. Retirement Timeline (replaces Year-by-Year)

**Primary chart: Income vs. Expenses**

- Stacked area chart showing income sources over time (pension, SS, TSP
  withdrawals, Roth withdrawals) against an expense line (desired income +
  health insurance + taxes)
- Clearly shows phases:
  - **Gap years** (retirement to SS): pension only, heavy TSP draws
  - **SS kicks in**: income rises, TSP draws decrease
  - **Medicare at 65**: health insurance cost drops
  - **RMDs at 73**: forced withdrawals begin

**Secondary chart: Account Balances**

- Keep the Traditional vs. Roth line chart
- Add a clear marker: "Savings depleted at age X" if applicable
- Add total net worth line (Traditional + Roth)

**Detail table**

- Keep the year-by-year table but add columns:
  - Health insurance cost
  - Spouse SS (separate from primary SS)
  - Net monthly income (the number she actually cares about)
- Remove or de-emphasize columns a non-expert won't use (marginal rate,
  conversion room)

#### 2. Withdrawal Strategy (replaces Roth Optimizer)

Same Roth conversion engine, reframed:

- **Headline:** "By converting $X to Roth over ages Y–Z, you save $X in
  lifetime taxes and your savings last N years longer."
- Show comparison: optimized strategy vs. no-conversion baseline
- Strategy cards: Total Converted, Tax Cost of Conversions, Traditional Balance
  at RMD Age, Roth Balance at RMD Age
- Conversion detail table with **correct** incremental tax cost (fix the
  `conversion × marginalRate` bug)
- Show the ACA subsidy interaction: "Converting $X this year reduces your ACA
  subsidy by $Y" (for pre-65 years)

#### 3. Where to Retire (replaces State Compare)

Simplified and more practical:

- **Default comparison set:** Utah (current), Florida, Texas, Nevada, Wyoming,
  Tennessee, Pennsylvania
- For each state, show:
  - Lifetime state tax on retirement income
  - Whether it taxes pension / SS / TSP withdrawals
  - Practical notes for part-time residents (residency requirements, property
    tax, etc.)
- **Use actual projected withdrawals** for the comparison (fix the hardcoded
  $30K bug)
- Remove states that aren't realistic options (California, Oregon, etc.)
  unless the user adds them

#### 4. Social Security Timing (keep, enhance)

The current tab works well. Enhancements:

- Add spouse's SS alongside primary earner
- Show combined household SS at each claiming combination
- Show how SS timing affects the withdrawal strategy (later SS = more years
  of low-income Roth conversion window)
- Spousal benefit note: if one spouse's benefit is much lower, they may get
  50% of the higher spouse's PIA instead

### Projection Engine Changes

The core loop in `projection.js` needs these changes:

1. **Two pension inputs** summed as household pension income
2. **Two SS inputs** with independent claim ages
3. **Health insurance expense** modeled per-spouse. Each spouse has their own
   Medicare start at age 65. Before 65, use the selected insurance type and
   cost. After the primary retiree hits 65, cost drops to Medicare rates for
   them; the spouse's cost drops when _they_ hit 65 (based on spouse's age).
4. **Inflation adjustment** applied to spending each year (not to pension —
   FERS COLA is separate and smaller than general inflation, but modeling it
   precisely is out of scope; using the same rate is close enough)
5. **IRMAA 2-year lookback** — store AGI history and apply IRMAA based on
   AGI from 2 years prior
6. **Correct Roth conversion tax cost** — use incremental tax calculation
7. **Capital gains rates** for home sale gains above the Section 121
   exclusion. Add LTCG brackets (0%/15%/20%) to `src/constants/federalTax.js`.
   In the projection, home sale gain is taxed at LTCG rates based on total
   taxable income, not at ordinary income rates.
8. **"Money runs out" detection** — flag the year where combined savings hit
   zero and calculate sustainable monthly income if savings must last to a
   target age (e.g., 92)
9. **Net monthly income output** — after all taxes, insurance, and spending,
   what's left per month. Defined as:
   `(total income - taxes - IRMAA - health insurance - spending) / 12`
   A positive number means surplus; negative means drawing from savings.

### Constants Updates

- Add ACA marketplace premium estimates by age band and income tier
  (`src/constants/healthInsurance.js`)
- Add FEHB average premiums for retirees
- Add long-term capital gains rate brackets (`src/constants/federalTax.js`)
- Update state profiles to include practical residency notes
  (`src/constants/stateTax.js`)

## Out of Scope (for now)

- Other savings/investments (taxable brokerage) — can add later when needed
- Independent spouse retirement date — v2 assumes both retire together
- Foreign property taxation / FBAR reporting (Peru properties)
- Rental income modeling
- Estate planning / inheritance
- Detailed ACA plan selection (Silver vs. Gold, etc.)
- WEP/GPO (relevant for CSRS, not FERS)
- Part-time work income during retirement
- FERS COLA modeling (using general inflation rate as approximation)
  These can be added later if needed. The tool should be useful without them.

## Success Criteria

The app is doing its job when your mom can:

1. Enter her numbers and immediately see whether she can afford to retire at
   her target age
2. See how long her savings last and what her monthly income looks like
3. Understand the impact of delaying retirement by 1-2 years
4. Compare 3-4 states and pick one for residency
5. See that Roth conversions (or not) save her $X over her lifetime
6. Understand when SS and Medicare kick in and how that changes her picture

She should be able to do all of this without understanding tax brackets, Roth
conversions, provisional income, or IRMAA. The app should explain its
recommendations in plain language.
