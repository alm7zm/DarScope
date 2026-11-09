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
