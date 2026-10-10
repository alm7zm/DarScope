import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../constants/messages.js';
import {
  EMPTY_FILTERS,
  isSearchActive,
  searchProperties,
} from '../utils/search.js';
import { validateFilters } from '../utils/validation.js';

/**
 * The search box and the filters above the property list (SRS section 6).
 *
 * Two pieces of text are held, not one: `text` is what is in the box right now, and `query` is
 * what the list is actually filtered by. The list follows 300 ms after the last keystroke, and at
 * once on Enter (FR-SRC-03).
 *
 * @param {Array<Record<string, unknown>>} properties The whole portfolio.
 */
export function usePropertySearch(properties) {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  /** Search now, without waiting for the pause. Enter in the search box calls this. */
  const commitSearch = useCallback(() => {
    setQuery(text);
  }, [text]);

  /** Change one filter, leaving the rest alone. */
  const setFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  }, []);

  /** Add or remove one value of a filter that accepts several, such as City. */
  const toggleFilter = useCallback((name, value) => {
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
    /** The properties the list should show. */
    matching,
    /** Whether anything is narrowing the list, which decides the empty message. */
    active: isSearchActive({ query, filters }),
  };
}
