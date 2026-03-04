import { DEFAULTS, PARAM_MAP, NUMERIC_FIELDS } from "../constants";

/**
 * Read input values from the current URL query parameters.
 * Falls back to DEFAULTS for any missing parameters.
 *
 * @returns {object} Full set of input values
 */
export function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const values = { ...DEFAULTS };

  for (const [shortKey, fullKey] of Object.entries(PARAM_MAP)) {
    const rawValue = params.get(shortKey);
    if (rawValue != null) {
      values[fullKey] = NUMERIC_FIELDS.has(fullKey)
        ? Number(rawValue)
        : rawValue;
    }
  }

  return values;
}

/**
 * Build a full URL encoding all non-default input values.
 * Only includes parameters that differ from defaults to keep URLs short.
 *
 * @param {object} state - Current input state
 * @returns {string} Full URL with query parameters
 */
export function buildShareURL(state) {
  const params = new URLSearchParams();

  for (const [shortKey, fullKey] of Object.entries(PARAM_MAP)) {
    const value = state[fullKey];
    if (value !== DEFAULTS[fullKey]) {
      params.set(shortKey, value);
    }
  }

  const queryString = params.toString();
  return (
    window.location.origin +
    window.location.pathname +
    (queryString ? "?" + queryString : "")
  );
}

/**
 * Update the browser URL bar without triggering navigation.
 *
 * @param {object} state - Current input state
 */
export function syncURLToState(state) {
  const url = buildShareURL(state);
  const relative = url.replace(window.location.origin, "");
  window.history.replaceState(null, "", relative);
}
