/**
 * Sorting the property list (FR-SRC-09), as pure functions. The list sorts a copy, so the
 * collection the context holds is never reordered in place (NFR-REL-04).
 */

/**
 * The five orders FR-SRC-09 offers, each with the field it reads and the label in the control.
 * `Last updated` is first because it is the default.
 * @type {ReadonlyArray<{ key: string, label: string, field: string, text?: boolean }>}
 */
export const SORT_OPTIONS = [
  { key: 'updatedAt', label: 'Last updated', field: 'updatedAt', text: true },
  { key: 'yearlyRentSar', label: 'Yearly rent', field: 'yearlyRentSar' },
  { key: 'sizeSqm', label: 'Size', field: 'sizeSqm' },
  { key: 'bedrooms', label: 'Bedrooms', field: 'bedrooms' },
  { key: 'city', label: 'City', field: 'city', text: true },
];

/** The default order: the most recently changed property first (FR-SRC-09). */
export const DEFAULT_SORT = { key: 'updatedAt', direction: 'desc' };

/** The two directions, with the wording that fits whichever field is chosen. */
export const DIRECTIONS = [
  { key: 'asc', label: 'Ascending' },
  { key: 'desc', label: 'Descending' },
];

/** The option for a key, falling back to the default rather than failing on a stray URL value. */
function optionFor(key) {
  return (
    SORT_OPTIONS.find((option) => option.key === key) ??
    SORT_OPTIONS.find((option) => option.key === DEFAULT_SORT.key)
  );
}

/**
 * Compare two values of one field. Text is compared with `localeCompare`, so Arabic district and
 * city names order sensibly rather than by code point. A missing value sorts last either way.
 */
function compareValues(left, right, text) {
  const leftMissing = left === null || left === undefined || left === '';
  const rightMissing = right === null || right === undefined || right === '';
  if (leftMissing || rightMissing) {
    if (leftMissing && rightMissing) return 0;
    return leftMissing ? 1 : -1;
  }

  if (text) return String(left).localeCompare(String(right));
  return Number(left) - Number(right);
}

/**
 * The properties in the chosen order (FR-SRC-09). Ties are broken by ID, so the order is stable
 * and two runs of the same search never swap two rows.
 *
 * @param {Array<Record<string, unknown>>} properties
 * @param {{ key?: string, direction?: 'asc' | 'desc' }} [sort]
 * @returns {Array<Record<string, unknown>>} A new array; the input is not touched.
 */
export function sortProperties(properties, sort = DEFAULT_SORT) {
  const option = optionFor(sort.key);
  const sign = sort.direction === 'asc' ? 1 : -1;

  return [...properties].sort((left, right) => {
    const compared = compareValues(
      left[option.field],
      right[option.field],
      option.text,
    );
    if (compared !== 0) return compared * sign;
    return String(left.id).localeCompare(String(right.id));
  });
}

/**
 * One page of a list (FR-LST-10). A page number beyond the end shows the last page rather than
 * nothing, which is what happens when the search narrows while the user is on page 5.
 *
 * @param {Array<unknown>} items
 * @param {{ page?: number, perPage?: number }} [paging]
 * @returns {{ items: Array<unknown>, page: number, pageCount: number, from: number, to: number }}
 *   `from` and `to` are 1-based positions for the "Showing 11 to 20" line.
 */
export function paginate(items, { page = 1, perPage = 10 } = {}) {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * perPage;
  const shown = items.slice(start, start + perPage);

  return {
    items: shown,
    page: current,
    pageCount,
    from: items.length === 0 ? 0 : start + 1,
    to: start + shown.length,
  };
}

/** How many properties a page may show (FR-LST-10). The first is the default. */
export const PAGE_SIZES = [10, 25, 50];
