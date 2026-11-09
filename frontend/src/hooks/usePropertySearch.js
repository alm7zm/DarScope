import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../constants/messages.js';
import {
  EMPTY_FILTERS,
  isSearchActive,
  searchProperties,
} from '../utils/search.js';
import { DEFAULT_PAGE_SIZE } from '../utils/sort.js';
import { validateFilters } from '../utils/validation.js';

/**
 * The search box, the filters and the page above the property list (SRS section 6, FR-LST-10).
 *
 * Two pieces of text are held, not one: `text` is what is in the box right now, and `query` is
 * what the list is actually filtered by. The list follows 300 ms after the last keystroke, and at
 * once on Enter (FR-SRC-03). Any change to the query, the filters or the page size goes back to
 * page 1 (FR-LST-10).
 *
 * @param {Array<Record<string, unknown>>} properties The whole portfolio.
 */
export function usePropertySearch(properties) {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPageCount] = useState(DEFAULT_PAGE_SIZE);

  // Only text that differs from the current search starts the clock. Otherwise opening the page,
  // or typing a letter and rubbing it out, would send the list back to page 1 a moment later,
  // even after the user had moved on to another page.
  useEffect(() => {
    if (text === query) return undefined;
    const timer = setTimeout(() => {
      setQuery(text);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, query]);

  /** Search now, without waiting for the pause. Enter in the search box calls this. */
  const commitSearch = useCallback(() => {
    setQuery(text);
    setPage(1);
  }, [text]);

  /** Show 10, 25 or 50 properties per page, starting again from page 1 (FR-LST-10). */
  const setPerPage = useCallback((count) => {
    setPerPageCount(count);
    setPage(1);
  }, []);

  /** Change one filter, leaving the rest alone. */
  const setFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }, []);

  /** Add or remove one value of a filter that accepts several, such as City. */
  const toggleFilter = useCallback((name, value) => {
    setPage(1);
    setFilters((current) => {
      const chosen = current[name] ?? [];
      return {
        ...current,
        [name]: chosen.includes(value)
          ? chosen.filter((each) => each !== value)
          : [...chosen, value],
      };
    });
  }, []);

  /** Empty the search box and reset every filter (FR-SRC-06). */
  const clearAll = useCallback(() => {
    setText('');
    setQuery('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  // A range whose "from" is above its "to" shows a message and is not applied (FR-SRC-07).
  const rangeErrors = useMemo(() => validateFilters(filters), [filters]);
  const skip = useMemo(
    () => ({
      rent: Boolean(rangeErrors.rent),
      size: Boolean(rangeErrors.size),
    }),
    [rangeErrors],
  );

  const matching = useMemo(
    () => searchProperties(properties, { query, filters, skip }),
    [properties, query, filters, skip],
  );

  return {
    /** What is in the search box. */
    text,
    setText,
    commitSearch,
    filters,
    setFilter,
    toggleFilter,
    clearAll,
    /** A message per range that is the wrong way round, keyed `rent` and `size`. */
    rangeErrors,
    /** Every property that matches, on every page. */
    matching,
    /** Whether anything is narrowing the list, which decides the empty message. */
    active: isSearchActive({ query, filters }),
    /** The page shown, counted from 1, and how many properties a page holds (FR-LST-10). */
    page,
    setPage,
    perPage,
    setPerPage,
  };
}
