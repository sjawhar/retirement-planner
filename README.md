# Federal Retirement Tax Planner

An interactive, client-side tax planning tool for federal employees (FERS/CSRS) approaching retirement. Models year-by-year withdrawal strategies across TSP, pension, Social Security, and home sale proceeds to minimize lifetime federal and state income taxes.

**[Live Demo →](#)** *(replace with your GitHub Pages URL)*

## Features

- **Year-by-Year Withdrawal Plan** — Projects income, taxes, and account balances from retirement through age 92
- **Roth Conversion Optimizer** — Models bracket-filling strategies (12% or 22%) to minimize future RMD tax exposure
- **State Tax Comparison** — Side-by-side analysis of 24 states for federal retirees (pension, SS, and TSP treatment)
- **Social Security Timing** — Cumulative benefit curves and break-even analysis for claiming at 62, 64, 67, and 70
- **Shareable Scenarios** — All inputs encode into URL parameters; bookmark or share specific configurations
- **Mobile Responsive** — Works on phone, tablet, and desktop
- **Fully Client-Side** — No server, no database, no tracking

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build & Deploy

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview

# Deploy to GitHub Pages (uses gh-pages package)
npm run deploy
```

Before deploying, update `base` in `vite.config.js` to match your repo name:

```js
base: "/your-repo-name/",
```

## Project Structure

```
├── index.html                    # HTML entry point
├── vite.config.js                # Vite config (set base path here)
├── package.json
│
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component (state, layout, routing)
│   │
│   ├── constants/                # All tax rules and config
│   │   ├── index.js              # Barrel export
│   │   ├── defaults.js           # Default inputs, URL param map, growth rate
│   │   ├── federalTax.js         # Brackets, standard deduction, SS thresholds
│   │   ├── irmaa.js              # Medicare surcharge thresholds
│   │   ├── rmd.js                # Required Minimum Distribution divisor table
│   │   └── stateTax.js           # State-by-state tax profiles (24 states)
│   │
│   ├── utils/                    # Calculation engines
│   │   ├── index.js              # Barrel export
│   │   ├── federalTax.js         # Progressive bracket math, SS taxable calc
│   │   ├── stateTax.js           # State tax with exemptions/deductions
│   │   ├── irmaa.js              # IRMAA tier lookup
│   │   ├── rmd.js                # RMD calculator
│   │   ├── socialSecurity.js     # Benefit estimator, timing comparison
│   │   ├── projection.js         # Year-by-year retirement model (core engine)
│   │   ├── urlParams.js          # Read/write URL query parameters
│   │   └── format.js             # Dollar and percentage formatters
│   │
│   ├── components/
│   │   ├── ui.jsx                # Shared primitives (Card, Slider, Tab, Toast)
│   │   ├── Sidebar.jsx           # Input controls panel
│   │   └── tabs/
│   │       ├── YearPlanTab.jsx   # Year-by-year projection charts + table
│   │       ├── RothTab.jsx       # Roth conversion optimizer
│   │       ├── StateTab.jsx      # State tax comparison
│   │       └── SSTab.jsx         # Social Security timing analysis
│   │
│   └── styles/
│       └── global.css            # Global styles, responsive breakpoints
│
├── README.md
└── LICENSE
```

## Tax Logic

All tax calculations live in `src/utils/` with constants in `src/constants/`. This separation makes it easy to update numbers annually without touching UI code.

| File | What it calculates |
|------|-------------------|
| `federalTax.js` | Progressive bracket tax, marginal rates, SS taxable portion, standard deduction |
| `stateTax.js` | State income tax with pension/SS/TSP exemptions per state profile |
| `irmaa.js` | Medicare Part B surcharge tiers |
| `rmd.js` | Required Minimum Distributions from the Uniform Lifetime Table |
| `socialSecurity.js` | Benefit estimates at different claiming ages, cumulative comparison |
| `projection.js` | **Core engine** — runs the full year-by-year model combining all of the above |

## Annual Updates

When the IRS publishes new numbers (typically October/November for the following tax year):

1. **Federal brackets** → `src/constants/federalTax.js` — update `BRACKETS_SINGLE`, `BRACKETS_MFJ`, `STANDARD_DEDUCTION`
2. **IRMAA thresholds** → `src/constants/irmaa.js` — update threshold arrays
3. **State tax changes** → `src/constants/stateTax.js` — update rates, exemption amounts, or add new states

### Adding a State

In `src/constants/stateTax.js`, add an entry to the `STATE_TAX_PROFILES` object:

```js
"New State": {
  rate: 0.05,              // Effective flat rate
  pensionExempt: false,     // true = doesn't tax federal pensions
  ssExempt: true,           // true = doesn't tax Social Security
  tspExempt: false,         // true = doesn't tax TSP/401k withdrawals
  retirementExemption: 20000,  // Optional dollar exemption
  ageReq: 65,               // Optional age requirement for exemption
  label: "Description for UI",
},
```

### Changing Growth Assumptions

Edit `ANNUAL_GROWTH_RATE` in `src/constants/defaults.js` (default: 0.05 = 5%).

### Changing Comparison States

Edit `DEFAULT_COMPARE_STATES` in `src/constants/stateTax.js`.

## URL Parameters

All inputs auto-save to the URL. Only non-default values are included to keep URLs short.

| Param | Field | Default |
|-------|-------|---------|
| `a` | Current age | 58 |
| `r` | Retirement age | 60 |
| `s` | Spouse's age | 56 |
| `f` | Filing status | mfj |
| `p` | FERS pension (annual) | 50000 |
| `tt` | TSP traditional balance | 600000 |
| `tr` | TSP Roth balance | 100000 |
| `sp` | SS PIA (monthly) | 2400 |
| `sc` | SS claim age | 67 |
| `hg` | Home sale gain (above exclusion) | 0 |
| `hy` | Home sale age | 62 |
| `ii` | Annual investment income | 5000 |
| `le` | Annual living expenses | 80000 |
| `st` | State | Virginia |
| `cs` | Conversion strategy | fill12 |

**Example:** `?p=55000&tt=800000&sc=70&st=Pennsylvania&cs=fill22`

## Tech Stack

- **Vite** — fast dev server and optimized production builds
- **React 18** — UI components and state management
- **Recharts** — charts (bar, line, responsive containers)
- **gh-pages** — one-command deploy to GitHub Pages

## Disclaimer

This tool provides estimates for educational planning purposes only. It is not financial, tax, or legal advice. Tax laws change frequently. Consult a qualified financial planner or CPA before making retirement decisions.

## License

MIT — see [LICENSE](LICENSE)
