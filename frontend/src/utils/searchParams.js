/**
 * The search state as URL query parameters, so Back restores a search and a narrowed list can be
 * bookmarked (FR-SRC-12). Pure functions: the URL is read and written in one place, and the hook
 * above them never parses a parameter itself.
 */
import { AMENITY_KEYS, CITIES, PROPERTY_TYPES, STATUSES } from '../constants/options.js';
import { EMPTY_FILTERS } from './search.js';
import { DEFAULT_SORT, PAGE_SIZES, SORT_OPTIONS } from './sort.js';

/**
 * The parameter name for each filter that accepts several values. Short names, because they end
 * up repeated in the URL: `?city=Riyadh&city=Jeddah`.
 */
const LIST_PARAMS = [
  { param: 'city', filter: 'cities', allowed: CITIES },
  { param: 'status', filter: 'statuses', allowed: STATUSES },
  { param: 'amenity', filter: 'amenities', allowed: AMENITY_KEYS },
];

/** The parameter name for each filter that holds one value. */
const VALUE_PARAMS = [
  { param: 'type', filter: 'propertyType', allowed: PROPERTY_TYPES },
  { param: 'beds', filter: 'minBedrooms' },
  { param: 'rentFrom', filter: 'rentFrom' },
  { param: 'rentTo', filter: 'rentTo' },
  { param: 'sizeFrom', filter: 'sizeFrom' },
  { param: 'sizeTo', filter: 'sizeTo' },
];

/** Digits only, or the fallback. A hand-edited URL must never put the list in a broken state. */
function readNumber(value, fallback) {
  return /^\d+$/.test(String(value ?? '')) ? Number(value) : fallback;
}

/**
 * The search state a URL describes. Anything missing or not recognised falls back to its default,
 * so a mistyped URL still shows a working list.
 *
 * @param {URLSearchParams} params
 * @returns {{
 *   query: string,
 *   filters: typeof EMPTY_FILTERS,
 *   sort: { key: string, direction: 'asc' | 'desc' },
 *   page: number,
 *   perPage: number,
 * }}
 */
export function readSearchState(params) {
  const filters = { ...EMPTY_FILTERS };

  for (const { param, filter, allowed } of LIST_PARAMS) {
    filters[filter] = params
      .getAll(param)
      .filter((value) => allowed.includes(value));
  }

  for (const { param, filter, allowed } of VALUE_PARAMS) {
    const value = params.get(param) ?? '';
    filters[filter] = allowed && !allowed.includes(value) ? '' : value;
  }

  const sortKey = params.get('sort');
  const perPage = readNumber(params.get('per'), PAGE_SIZES[0]);

  return {
    query: params.get('q') ?? '',
    filters,
    sort: {
      key: SORT_OPTIONS.some((option) => option.key === sortKey)
        ? sortKey
        : DEFAULT_SORT.key,
      direction: params.get('dir') === 'asc' ? 'asc' : 'desc',
    },
    page: Math.max(1, readNumber(params.get('page'), 1)),
    perPage: PAGE_SIZES.includes(perPage) ? perPage : PAGE_SIZES[0],
  };
}

/**
 * The URL parameters for a search state. Anything at its default is left out, so an untouched
 * list has a clean `/properties` URL and only what the user changed shows up.
 *
 * @param {ReturnType<typeof readSearchState>} state
 * @returns {URLSearchParams}
 */
export function writeSearchState({
  query = '',
  filters = EMPTY_FILTERS,
  sort = DEFAULT_SORT,
  page = 1,
  perPage = PAGE_SIZES[0],
} = {}) {
  const params = new URLSearchParams();

  if (query !== '') params.set('q', query);

  for (const { param, filter } of LIST_PARAMS) {
    for (const value of filters[filter] ?? []) params.append(param, value);
  }

  for (const { param, filter } of VALUE_PARAMS) {
    const value = filters[filter] ?? '';
    if (value !== '') params.set(param, value);
  }

  if (sort.key !== DEFAULT_SORT.key) params.set('sort', sort.key);
  if (sort.direction !== DEFAULT_SORT.direction) {
    params.set('dir', sort.direction);
  }
  if (page > 1) params.set('page', String(page));
  if (perPage !== PAGE_SIZES[0]) params.set('per', String(perPage));

  return params;
}
