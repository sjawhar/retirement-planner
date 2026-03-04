// @ts-check
import { test, expect } from "@playwright/test";

const BASE = "/retirement-planner/";

test.describe("App loads and renders", () => {
  test("page title and header", async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle("Federal Retirement Tax Planner");
    await expect(page.locator("h1")).toHaveText("Federal Retirement Tax Planner");
    await expect(page.locator(".header-sub")).toContainText("FERS · TSP · Social Security");
  });

  test("summary cards render with default values", async ({ page }) => {
    await page.goto(BASE);
    const cards = page.locator(".summary-cards > div");
    await expect(cards).toHaveCount(4);

    // Each card should have a title and value
    await expect(cards.nth(0)).toContainText("Savings Last To");
    await expect(cards.nth(1)).toContainText("Monthly Income");
    await expect(cards.nth(2)).toContainText("Health Insurance");
    await expect(cards.nth(3)).toContainText("Tax Optimization Saves");
  });

  test("sidebar renders with all input sections", async ({ page }) => {
    await page.goto(BASE);
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();

    // Check section titles
    await expect(sidebar).toContainText("Your Situation");
    await expect(sidebar).toContainText("Income Sources");
    await expect(sidebar).toContainText("Planning");

    // Check key inputs exist
    await expect(sidebar.locator("select")).toHaveCount(3); // Filing, State, Roth Strategy
    await expect(sidebar.locator('input[type="range"]')).toHaveCount(11); // All sliders (MFJ has spouse age)
  });

  test("no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(BASE);
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test("charts render as SVGs", async ({ page }) => {
    await page.goto(BASE);

    // Year-by-Year tab should have recharts SVGs
    const svgs = page.locator("svg");
    const count = await svgs.count();
    expect(count).toBeGreaterThanOrEqual(2); // Income vs Expenses + account balances charts
  });
});

test.describe("Tab navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("Year-by-Year tab is active by default", async ({ page }) => {
    // Table should be visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Should have rows from retirement age (60) to age 92
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(33); // ages 60-92
  });

  test("Roth Optimizer tab", async ({ page }) => {
    await page.getByRole("button", { name: /Roth Optimizer/i }).click();

    // Strategy description should be visible
    await expect(page.locator("text=Strategy:")).toBeVisible();
    await expect(page.locator("text=Fill the 12% bracket")).toBeVisible();

    // Summary cards
    await expect(page.locator("text=Total Converted")).toBeVisible();
    await expect(page.locator("text=Best Window")).toBeVisible();
    await expect(page.locator("text=Trad at 73")).toBeVisible();
    await expect(page.locator("text=Roth at 73")).toBeVisible();

    // Conversion detail table
    await expect(page.locator("text=Conversion Detail")).toBeVisible();
  });

  test("State Compare tab", async ({ page }) => {
    await page.getByRole("button", { name: /State Compare/i }).click();

    // Bar chart title
    await expect(page.getByRole("heading", { name: /Lifetime State Tax/ })).toBeVisible();

    // State cards
    const stateCards = page.locator(".state-grid > div");
    await expect(stateCards).toHaveCount(6); // Virginia + 5 comparison states

    // Current state badge
    await expect(page.getByText("CURRENT", { exact: true })).toBeVisible();

    // Comparison values
    await expect(page.locator("text=Avg/Year:").first()).toBeVisible();
    await expect(page.locator("text=Lifetime:").first()).toBeVisible();
  });

  test("SS Timing tab", async ({ page }) => {
    await page.getByRole("button", { name: /SS Timing/i }).click();

    // Claim age cards
    const ssCards = page.locator(".ss-cards > div");
    await expect(ssCards).toHaveCount(4); // ages 62, 64, 67, 70

    await expect(page.locator("text=Claim at 62")).toBeVisible();
    await expect(page.locator("text=Claim at 67")).toBeVisible();
    await expect(page.locator("text=Claim at 70")).toBeVisible();

    // Cumulative benefits chart
    await expect(page.locator("text=Cumulative Benefits by Claiming Age")).toBeVisible();

    // Break-even analysis
    await expect(page.locator("text=Break-Even Analysis")).toBeVisible();

    // Tax impact note
    await expect(page.locator("text=Tax Impact:")).toBeVisible();
  });

  test("tabs switch content correctly", async ({ page }) => {
    // Start on Year-by-Year
    await expect(page.locator("text=Income vs Expenses")).toBeVisible();

    // Switch to Roth
    await page.getByRole("button", { name: /Roth Optimizer/i }).click();
    await expect(page.locator("text=Income vs Expenses")).not.toBeVisible();
    await expect(page.locator("text=Strategy:")).toBeVisible();

    // Switch to States
    await page.getByRole("button", { name: /State Compare/i }).click();
    await expect(page.locator("text=Strategy:")).not.toBeVisible();
    await expect(page.locator(".state-grid")).toBeVisible();

    // Switch to SS
    await page.getByRole("button", { name: /SS Timing/i }).click();
    await expect(page.locator(".state-grid")).not.toBeVisible();
    await expect(page.locator(".ss-cards")).toBeVisible();

    // Back to Year-by-Year
    await page.getByRole("button", { name: /Year-by-Year/i }).click();
    await expect(page.locator("text=Income vs Expenses")).toBeVisible();
  });
});

test.describe("Sidebar interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("filing status toggle hides/shows spouse age", async ({ page }) => {
    // MFJ by default — spouse age visible
    await expect(page.locator("text=Spouse's Age")).toBeVisible();

    // Switch to Single
    await page.locator("select").first().selectOption("single");
    await expect(page.locator("text=Spouse's Age")).not.toBeVisible();

    // Switch back to MFJ
    await page.locator("select").first().selectOption("mfj");
    await expect(page.locator("text=Spouse's Age")).toBeVisible();
  });

  test("changing Roth strategy updates display", async ({ page }) => {
    // Switch to Roth tab
    await page.getByRole("button", { name: /Roth Optimizer/i }).click();
    await expect(page.locator("text=Fill the 12% bracket")).toBeVisible();

    // Change to fill22
    await page.locator("select").nth(2).selectOption("fill22");
    await expect(page.locator("text=Fill the 22% bracket")).toBeVisible();

    // Change to none
    await page.locator("select").nth(2).selectOption("none");
    await expect(page.getByText("No conversions —")).toBeVisible();
  });

  test("home sale gain shows sale age slider", async ({ page }) => {
    // Sale at Age should not be visible when gain is 0
    await expect(page.locator("text=Sale at Age")).not.toBeVisible();

    // Set home sale gain > 0 by manipulating the slider
    const homeSaleSlider = page.locator('input[type="range"]').nth(9);
    await homeSaleSlider.fill("100000");
    await expect(page.locator("text=Sale at Age")).toBeVisible();
  });

  test("sidebar toggle works", async ({ page }) => {
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();

    // Hide sidebar
    await page.getByRole("button", { name: /Hide/i }).click();
    await expect(sidebar).not.toBeVisible();

    // Show sidebar
    await page.getByRole("button", { name: /Inputs/i }).click();
    await expect(sidebar).toBeVisible();
  });
});

test.describe("URL parameters", () => {
  test("loads default values without params", async ({ page }) => {
    await page.goto(BASE);

    // Check filing status default
    const filing = await page.locator("select").first().inputValue();
    expect(filing).toBe("mfj");

    // Check state default
    const state = await page.locator("select").nth(1).inputValue();
    expect(state).toBe("Virginia");
  });

  test("loads custom values from URL params", async ({ page }) => {
    await page.goto(`${BASE}?p=65000&tt=800000&sc=70&st=Florida&f=single`);

    // Filing
    const filing = await page.locator("select").first().inputValue();
    expect(filing).toBe("single");

    // State
    const state = await page.locator("select").nth(1).inputValue();
    expect(state).toBe("Florida");

    // Pension (slider 2 for single filer — no spouse age slider)
    const pension = await page.locator('input[type="range"]').nth(2).inputValue();
    expect(pension).toBe("65000");

    // TSP Traditional (slider 3 for single)
    const tsp = await page.locator('input[type="range"]').nth(3).inputValue();
    expect(tsp).toBe("800000");

    // SS Claim Age (slider 6 for single)
    const ssAge = await page.locator('input[type="range"]').nth(6).inputValue();
    expect(ssAge).toBe("70");
  });

  test("URL updates when inputs change", async ({ page }) => {
    await page.goto(BASE);

    // Change state to Florida
    await page.locator("select").nth(1).selectOption("Florida");
    await page.waitForTimeout(300);

    const url = page.url();
    expect(url).toContain("st=Florida");
  });

  test("non-default params appear in URL, defaults do not", async ({ page }) => {
    await page.goto(BASE);
    const defaultUrl = page.url();

    // Default URL should have no query params
    expect(new URL(defaultUrl).search).toBe("");

    // Change one value
    await page.locator("select").nth(1).selectOption("Pennsylvania");
    await page.waitForTimeout(300);

    const updatedUrl = page.url();
    expect(updatedUrl).toContain("st=Pennsylvania");
    // Other defaults should not be in URL
    expect(updatedUrl).not.toContain("p=50000");
    expect(updatedUrl).not.toContain("f=mfj");
  });
});

test.describe("Calculations sanity checks", () => {
  test("no-tax states show zero state tax", async ({ page }) => {
    await page.goto(`${BASE}?st=Florida`);
    await page.getByRole("button", { name: /State Compare/i }).click();

    // The current state card should show $0
    const currentStateCard = page.locator(".state-grid > div").filter({ hasText: "CURRENT" });
    await expect(currentStateCard).toContainText("$0");
  });

  test("higher pension increases monthly income", async ({ page }) => {
    // Low pension
    await page.goto(`${BASE}?p=20000`);
    const lowPensionCard = page.locator(".summary-cards > div").nth(1);
    const lowPensionText = await lowPensionCard.textContent();
    const lowPensionMatch = lowPensionText.match(/\$([\d,]+)/);
    const lowIncome = parseInt(lowPensionMatch[1].replace(/,/g, ""));

    // High pension
    await page.goto(`${BASE}?p=120000`);
    const highPensionCard = page.locator(".summary-cards > div").nth(1);
    const highPensionText = await highPensionCard.textContent();
    const highPensionMatch = highPensionText.match(/\$([\d,]+)/);
    const highIncome = parseInt(highPensionMatch[1].replace(/,/g, ""));

    expect(highIncome).toBeGreaterThan(lowIncome);
  });

  test("Roth conversions reduce traditional balance at age 73", async ({ page }) => {
    // With conversions
    await page.goto(`${BASE}?cs=fill12`);
    await page.getByRole("button", { name: /Roth Optimizer/i }).click();
    const tradAt73With = await page.locator("text=Trad at 73").locator("..").textContent();

    // Without conversions
    await page.goto(`${BASE}?cs=none`);
    await page.getByRole("button", { name: /Roth Optimizer/i }).click();
    const tradAt73Without = await page.locator("text=Trad at 73").locator("..").textContent();

    // Traditional balance should be lower with conversions
    const parseVal = (text) => {
      const match = text.match(/\$([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, "")) : 0;
    };

    expect(parseVal(tradAt73With)).toBeLessThan(parseVal(tradAt73Without));
  });

  test("delaying SS increases monthly benefit", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /SS Timing/i }).click();

    // Extract monthly values from cards
    const cards = page.locator(".ss-cards > div");
    const claim62Text = await cards.nth(0).textContent();
    const claim70Text = await cards.nth(3).textContent();

    const parseMonthly = (text) => {
      const match = text.match(/\$([\d,]+)\/mo/);
      return match ? parseInt(match[1].replace(/,/g, "")) : 0;
    };

    const monthly62 = parseMonthly(claim62Text);
    const monthly70 = parseMonthly(claim70Text);

    expect(monthly70).toBeGreaterThan(monthly62);
    // Age 70 should be ~124/70 = ~1.77x of age 62
    expect(monthly70 / monthly62).toBeGreaterThan(1.5);
  });

  test("year-by-year table has correct age range", async ({ page }) => {
    await page.goto(`${BASE}?r=62`);

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow.locator("td").first()).toHaveText("62");

    const lastRow = page.locator("tbody tr").last();
    await expect(lastRow.locator("td").first()).toHaveText("92");

    const rowCount = await page.locator("tbody tr").count();
    expect(rowCount).toBe(31); // ages 62-92 = 31 years
  });
});

test.describe("Responsive and UI features", () => {
  test("disclaimer is present", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Disclaimer:")).toBeVisible();
    await expect(page.locator("text=not financial, tax, or legal advice")).toBeVisible();
  });

  test("header buttons are present", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole("button", { name: /Share This Scenario/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reset Defaults/i })).toBeVisible();
  });

  test("reset defaults restores initial values", async ({ page }) => {
    await page.goto(`${BASE}?p=100000&st=Florida`);

    // Verify non-default values loaded
    const state = await page.locator("select").nth(1).inputValue();
    expect(state).toBe("Florida");

    // Click Reset Defaults
    await page.getByRole("button", { name: /Reset Defaults/i }).click();
    await page.waitForTimeout(300);

    // Verify defaults restored
    const resetState = await page.locator("select").nth(1).inputValue();
    expect(resetState).toBe("Virginia");

    // URL should be clean
    expect(new URL(page.url()).search).toBe("");
  });
});
