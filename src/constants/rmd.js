// Uniform Lifetime Table (Table III) for RMD calculations
// Used for account owners whose sole beneficiary is NOT a spouse
// more than 10 years younger. Covers the vast majority of cases.
// Source: IRS Publication 590-B, updated under SECURE 2.0
//
// RMD = Prior year-end balance / divisor
// RMDs begin at age 73 (born 1951–1959) or 75 (born 1960+, starting 2033)

export const RMD_DIVISOR_TABLE = {
  72: 27.4,
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4,
};

// Age at which RMDs begin (using 73 as default; adjust for birth year)
export const RMD_START_AGE = 73;

// Fallback divisor for ages beyond the table
export const RMD_FALLBACK_DIVISOR = 6.4;
