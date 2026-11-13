import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_DEBOUNCE_MS } from '../constants/messages.js';
import { makePortfolio } from '../test/fixtures.js';
import { usePropertySearch } from './usePropertySearch.js';

// The search follows typing after a pause (FR-SRC-03), so these tests drive the clock themselves.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const portfolio = makePortfolio();

function renderSearch() {
  return renderHook(() => usePropertySearch(portfolio)).result;
}

describe('usePropertySearch: the page (FR-LST-10)', () => {
  it('keeps the page the user chose while nothing has been searched', () => {
    const search = renderSearch();

    act(() => search.current.setPage(2));
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2));

    expect(search.current.page).toBe(2);
  });

  it('goes back to page 1 once typed text becomes the search', () => {
    const search = renderSearch();
    act(() => search.current.setPage(2));

    act(() => search.current.setText('Riyadh'));
    expect(search.current.page).toBe(2);

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(search.current.page).toBe(1);
  });

  it('stays on its page when the text is typed and rubbed out before the pause ends', () => {
    const search = renderSearch();
    act(() => search.current.setPage(2));

    act(() => search.current.setText('R'));
    act(() => search.current.setText(''));
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2));

    expect(search.current.page).toBe(2);
  });

  it('goes back to page 1 when a filter, the page size or Clear all changes the list', () => {
    const search = renderSearch();

    act(() => search.current.setPage(3));
    act(() => search.current.toggleFilter('cities', 'Riyadh'));
    expect(search.current.page).toBe(1);

    act(() => search.current.setPage(3));
    act(() => search.current.setFilter('propertyType', 'Villa'));
    expect(search.current.page).toBe(1);

    act(() => search.current.setPage(3));
    act(() => search.current.setPerPage(25));
    expect(search.current).toMatchObject({ page: 1, perPage: 25 });

    act(() => search.current.setPage(3));
    act(() => search.current.clearAll());
    expect(search.current.page).toBe(1);
  });

  it('starts on page 1 with 10 a page', () => {
    expect(renderSearch().current).toMatchObject({ page: 1, perPage: 10 });
  });
});

describe('usePropertySearch: sort and starting state (FR-SRC-09, FR-SRC-12)', () => {
  it('starts from the state it is given, such as one read from a URL', () => {
    const { result } = renderHook(() =>
      usePropertySearch(portfolio, {
        query: 'villa',
        filters: { statuses: ['Vacant'] },
        sort: { key: 'yearlyRentSar', direction: 'asc' },
        page: 2,
        perPage: 25,
      }),
    );

    expect(result.current).toMatchObject({
      text: 'villa',
      query: 'villa',
      sort: { key: 'yearlyRentSar', direction: 'asc' },
      page: 2,
      perPage: 25,
    });
    expect(result.current.filters.statuses).toEqual(['Vacant']);
    // A filter the URL did not mention is still there, and empty.
    expect(result.current.filters.cities).toEqual([]);
  });

  it('sorts newest first by default, and leaves paging to the server', () => {
    const search = renderSearch();

    expect(search.current.sort).toEqual({
      key: 'updatedAt',
      direction: 'desc',
    });
    expect(search.current.browserPaged).toBe(false);
  });

  it('pages in the browser once another order is chosen, and goes back to page 1', () => {
    const search = renderSearch();
    act(() => search.current.setPage(3));

    act(() => search.current.setSort({ key: 'sizeSqm' }));

    expect(search.current.sort).toEqual({ key: 'sizeSqm', direction: 'desc' });
    expect(search.current.page).toBe(1);
    expect(search.current.browserPaged).toBe(true);
    // An order alone is not a search: the empty-portfolio message must not turn into
    // "no properties match".
    expect(search.current.active).toBe(false);
  });

  it('changes only the direction when only the direction is given', () => {
    const search = renderSearch();

    act(() => search.current.setSort({ direction: 'asc' }));

    expect(search.current.sort).toEqual({ key: 'updatedAt', direction: 'asc' });
  });

  it('clears the search text at once with clearQuery', () => {
    const search = renderSearch();
    act(() => search.current.setText('Riyadh'));
    act(() => search.current.commitSearch());
    expect(search.current.query).toBe('Riyadh');

    act(() => search.current.clearQuery());

    expect(search.current).toMatchObject({ text: '', query: '', page: 1 });
  });
});
