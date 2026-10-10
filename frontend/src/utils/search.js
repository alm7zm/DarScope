/**
 * Keyword search and the filters, as pure functions (SRS section 6). Both sides of every text
 * comparison go through `normalise`, so Arabic spelling variants of one word match and letter
 * case never matters (FR-SRC-02, FR-SRC-08, FR-SRC-11).
 */
import { AMENITIES } from '../constants/options.js';
import { normalise } from './arabic.js';
import { toWholeNumber } from './validation.js';

/** No search and no filter set: everything is listed. */
export const EMPTY_FILTERS = {
  cities: [],
  statuses: [],
  propertyType: '',
  rentFrom: '',
  rentTo: '',
  sizeFrom: '',
  sizeTo: '',
  minBedrooms: '',
};

/**
 * The text one property is searched through: its ID, city, district, type, status, tenant name
 * and description, plus the labels of the amenities it has (FR-SRC-02). Normalised once per
 * property per search.
 * @param {Record<string, unknown>} property
 * @returns {string}
 */
export function searchableText(property) {
  const amenityLabels = AMENITIES.filter(
    (amenity) => property.amenities?.[amenity.key],
  ).map((amenity) => amenity.label);

  return normalise(
    [
      property.id,
      property.city,
      property.district,
      property.propertyType,
      property.status,
      property.tenantName,
      property.description,
      ...amenityLabels,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

/**
 * Whether every word typed appears somewhere in the property's searchable text. The words may
 * land in different fields: "riyadh villa" matches a villa in Riyadh (FR-SRC-02).
 * @param {Record<string, unknown>} property
 * @param {string} query
 * @returns {boolean} True for an empty query, which filters nothing out.
 */
export function matchesKeywords(property, query) {
  const words = normalise(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;

  const text = searchableText(property);
  return words.every((word) => text.includes(word));
}

/**
 * Whether a number is inside a range. An end that is missing or not a whole number is treated as
 * no limit, which is also how an unapplied invalid range behaves (FR-SRC-07).
 */
function withinRange(value, from, to) {
  const low = toWholeNumber(from);
  const high = toWholeNumber(to);
  if (low !== null && value < low) return false;
  if (high !== null && value > high) return false;
  return true;
}

/**
 * Whether a property satisfies every filter that is set. An empty list or an empty string means
 * that filter is not set, so it excludes nothing (FR-SRC-04, FR-SRC-05).
 *
 * @param {Record<string, unknown>} property
 * @param {typeof EMPTY_FILTERS} filters
 * @param {{ rent?: boolean, size?: boolean }} [skip] Ranges that failed their check and must not
 *   be applied (FR-SRC-07).
 * @returns {boolean}
 */
export function matchesFilters(property, filters = EMPTY_FILTERS, skip = {}) {
  if (filters.cities?.length > 0 && !filters.cities.includes(property.city)) {
    return false;
  }

  if (
    filters.statuses?.length > 0 &&
    !filters.statuses.includes(property.status)
  ) {
    return false;
  }

  if (filters.propertyType && property.propertyType !== filters.propertyType) {
    return false;
  }

  if (
    !skip.rent &&
    !withinRange(property.yearlyRentSar, filters.rentFrom, filters.rentTo)
  ) {
    return false;
  }

  if (
    !skip.size &&
    !withinRange(property.sizeSqm, filters.sizeFrom, filters.sizeTo)
  ) {
    return false;
  }

  const minBedrooms = toWholeNumber(filters.minBedrooms);
  if (minBedrooms !== null && property.bedrooms < minBedrooms) {
    return false;
  }

  return true;
}

/**
 * The properties that satisfy the search box and every filter at once (FR-SRC-05). The order of
 * the input is kept; sorting is FR-SRC-09 and belongs to stage 2.
 *
 * @param {Array<Record<string, unknown>>} properties
 * @param {{ query?: string, filters?: typeof EMPTY_FILTERS, skip?: { rent?: boolean, size?: boolean } }} [options]
 * @returns {Array<Record<string, unknown>>}
 */
export function searchProperties(properties, options = {}) {
  const { query = '', filters = EMPTY_FILTERS, skip = {} } = options;

  return properties.filter(
    (property) =>
      matchesKeywords(property, query) &&
      matchesFilters(property, filters, skip),
  );
}

/**
 * Whether anything is narrowing the list, which decides between the "no properties yet" and the
 * "no properties match your search" message (FR-LST-05).
 * @param {{ query?: string, filters?: typeof EMPTY_FILTERS }} options
 * @returns {boolean}
 */
export function isSearchActive({ query = '', filters = EMPTY_FILTERS } = {}) {
  if (normalise(query) !== '') return true;

  return Object.entries(EMPTY_FILTERS).some(([key, empty]) => {
    const value = filters[key];
    if (Array.isArray(empty)) return (value?.length ?? 0) > 0;
    return (value ?? '') !== '';
  });
}
