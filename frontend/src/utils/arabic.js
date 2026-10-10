/**
 * Text normalisation for matching, following SRS Appendix B.4. Arabic writes the same word in
 * several ways, so search compares normalised text on both sides. Normalising is for matching
 * only: the app always displays the original text (FR-SRC-08, FR-SRC-11).
 */

/** Arabic diacritics (U+064B to U+0652) and the tatweel, which carry no meaning for matching. */
const DIACRITICS_AND_TATWEEL = /[\u064B-\u0652\u0640]/g;

/** The alif variants أ إ آ ٱ, all written as a plain alif for matching. */
const ALIF_VARIANTS = /[\u0623\u0625\u0622\u0671]/g;

/** A leading "حي " (the word for district), stripped for district comparison only (step 8). */
const LEADING_DISTRICT_WORD = /^\u062D\u064A\s+/;

/** The Arabic-Indic digits ٠ to ٩, which become 0 to 9. */
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;

/**
 * Normalise text for matching, applying steps 1 to 7 of SRS Appendix B.4.
 * @param {unknown} value Any value; anything that is not a string normalises to an empty string.
 * @param {{ stripDistrictWord?: boolean }} [options] `stripDistrictWord` adds step 8, which is
 *   for the district comparison in Appendix B.2 only.
 * @returns {string} The normalised text.
 */
export function normalise(value, options = {}) {
  if (typeof value !== 'string') return '';

  let text = value
    .toLowerCase()
    .replace(DIACRITICS_AND_TATWEEL, '')
    .replace(ALIF_VARIANTS, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(ARABIC_INDIC_DIGITS, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (options.stripDistrictWord) {
    text = text.replace(LEADING_DISTRICT_WORD, '');
  }

  return text;
}

/**
 * Whether the text contains at least one Arabic letter, so that the element showing it can be
 * marked `lang="ar"` for screen readers (NFR-ACC-07).
 * @param {unknown} value
 * @returns {boolean}
 */
export function hasArabic(value) {
  return typeof value === 'string' && /[\u0600-\u06FF]/.test(value);
}

/**
 * The attributes to spread onto any element that shows property text, so Arabic reads
 * right-to-left inside the English layout and screen readers pronounce it correctly
 * (FR-LST-07, NFR-ACC-07).
 * @param {unknown} value The text that will be displayed.
 * @returns {{ dir: 'auto', lang?: 'ar' }}
 */
export function textDirection(value) {
  return hasArabic(value) ? { dir: 'auto', lang: 'ar' } : { dir: 'auto' };
}
