/** The rent suggestion's constants (SRS 7.6): the one place these numbers are set. */

/** Suggested rents are rounded to the nearest 500 SAR (FR-ADD-13). */
export const RENT_ROUNDING_SAR = 500;

/**
 * A rent more than this many times the suggestion, or less than its share, is probably mistyped
 * (FR-RNT-07). At 3, only 0.3% of the real rents in the test set would be flagged, and an extra
 * or a missing zero always is.
 */
export const RENT_CHECK_FACTOR = 3;
