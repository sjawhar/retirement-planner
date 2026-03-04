// IRMAA (Income-Related Monthly Adjustment Amount) thresholds
// These are the MAGI thresholds that trigger Medicare Part B surcharges
// Based on income from TWO years prior (e.g., 2024 income affects 2026 premiums)
// Update annually — CMS publishes these around September for the following year

export const IRMAA_THRESHOLDS_MFJ = [218000, 274000, 342000, 410000, 750000];
export const IRMAA_THRESHOLDS_SINGLE = [109000, 137000, 171000, 205000, 500000];

// Annual per-person Part B surcharge at each tier (above standard premium)
// Tier 0 = standard premium (no surcharge)
export const IRMAA_ANNUAL_SURCHARGE = [0, 972, 2436, 3900, 5352, 7080];
