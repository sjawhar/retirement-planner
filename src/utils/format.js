/**
 * Format a number as a dollar amount with commas, rounded to whole dollars.
 * @param {number} n
 * @returns {string} e.g. "$1,234,567"
 */
export function fmt(n) {
  return "$" + Math.round(n || 0).toLocaleString();
}

/**
 * Format a decimal as a percentage string.
 * @param {number} n - Decimal (e.g. 0.22)
 * @returns {string} e.g. "22.0%"
 */
export function fmtPct(n) {
  return (n * 100).toFixed(1) + "%";
}
