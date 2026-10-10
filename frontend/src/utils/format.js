/**
 * How numbers, dates and titles are written in the interface (FR-LST-06, SRS 3.5). These are the
 * only place the app formats a value for display, so the list, the detail page and the dashboard
 * all read the same.
 */

/** Thousands separators come from one formatter, so every screen groups digits the same way. */
const groupedNumber = new Intl.NumberFormat('en-US');

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Yearly rent with thousands separators and its currency (FR-LST-06).
 * @param {unknown} value
 * @returns {string} For example `120,000 SAR`, or a dash when there is no number.
 */
export function formatRent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${groupedNumber.format(value)} SAR`;
}

/**
 * Size in square metres (FR-LST-06).
 * @param {unknown} value
 * @returns {string} For example `450 m²`, or a dash when there is no number.
 */
export function formatSize(value) {
  if (!Number.isFinite(value)) return '—';
  return `${groupedNumber.format(value)} m²`;
}

/**
 * A plain count, grouped for readability.
 * @param {unknown} value
 * @returns {string}
 */
export function formatCount(value) {
  if (!Number.isFinite(value)) return '—';
  return groupedNumber.format(value);
}

/**
 * Age in years, where 0 means a new property (SRS 3.1).
 * @param {unknown} value
 * @returns {string}
 */
export function formatAge(value) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return 'New';
  return value === 1 ? '1 year' : `${groupedNumber.format(value)} years`;
}

/**
 * A date-only value such as a lease date. The parts are read straight from the `YYYY-MM-DD`
 * string: turning it into a Date first would shift the day for anyone west of UTC.
 * @param {unknown} value
 * @returns {string} For example `15 January 2026`, or a dash when there is no date.
 */
export function formatDate(value) {
  if (typeof value !== 'string') return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return '—';
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return '—';
  return `${Number(day)} ${monthName} ${year}`;
}

/**
 * A timestamp such as `createdAt`, shown in UTC so that the same record reads the same for every
 * member of the team and in every test.
 * @param {unknown} value An ISO date-and-time string.
 * @returns {string} For example `15 January 2026, 09:30 UTC`, or a dash when there is no value.
 */
export function formatDateTime(value) {
  if (typeof value !== 'string') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = date.getUTCDate();
  const monthName = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day} ${monthName} ${year}, ${hours}:${minutes} UTC`;
}

/**
 * The display title of a property, calculated when needed and never stored (SRS 3.5).
 * @param {{ propertyType?: string, district?: string, city?: string }} property
 * @returns {string} For example `Villa in Al Malqa, Riyadh`.
 */
export function displayTitle(property) {
  if (!property) return '';
  const { propertyType, district, city } = property;
  return `${propertyType} in ${district}, ${city}`;
}
