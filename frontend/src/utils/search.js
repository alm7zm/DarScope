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
  amenities: [],
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

  // Every ticked amenity must be present, not just one of them (FR-SRC-10).
  if (
    filters.amenities?.length > 0 &&
    !filters.amenities.every((key) => property.amenities?.[key])
  ) {
    return false;
  }

  return true;
}

/**
 * The properties that satisfy the search box and every filter at once (FR-SRC-05). The order of
 * the input is kept: sorting is a separate step, in `utils/sort.js` (FR-SRC-09).
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

/** How each single-value filter is worded on its chip (FR-SRC-13). */
const CHIP_LABELS = {
  propertyType: (value) => `Type: ${value}`,
  minBedrooms: (value) => `Bedrooms: ${value}+`,
  rentFrom: (value) => `Rent from ${value} SAR`,
  rentTo: (value) => `Rent to ${value} SAR`,
  sizeFrom: (value) => `Size from ${value} m²`,
  sizeTo: (value) => `Size to ${value} m²`,
};

/**
 * One chip per filter that is set, so the user can see and undo each one without opening the
 * filter panel (FR-SRC-13). The search text is not a chip: it is visible in the search box.
 *
 * @param {typeof EMPTY_FILTERS} filters
 * @returns {Array<{ id: string, label: string, name: string, value: string | null }>} `name` is
 *   the filter to change and `value` the one entry to remove, or null to clear the whole filter.
 */
export function activeFilterChips(filters = EMPTY_FILTERS) {
  /** @type {Array<{ id: string, label: string, name: string, value: string | null }>} */
  const chips = [];

  for (const name of ['cities', 'statuses']) {
    for (const value of filters[name] ?? []) {
      chips.push({ id: `${name}-${value}`, label: value, name, value });
    }
  }

  for (const key of filters.amenities ?? []) {
    const amenity = AMENITIES.find((each) => each.key === key);
    if (amenity) {
      chips.push({
        id: `amenities-${key}`,
        label: amenity.label,
        name: 'amenities',
        value: key,
      });
    }
  }

  for (const [name, label] of Object.entries(CHIP_LABELS)) {
    const value = filters[name] ?? '';
    if (value !== '') {
      chips.push({ id: name, label: label(value), name, value: null });
    }
  }

  return chips;
}
