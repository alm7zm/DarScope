import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS } from './search.js';
import { readSearchState, writeSearchState } from './searchParams.js';

/** The search state a URL's query string describes. */
function read(query) {
  return readSearchState(new URLSearchParams(query));
}

describe('the search state in the URL (FR-SRC-12)', () => {
  it('reads a bare URL as no search, Last updated newest first, page 1 of 10', () => {
    expect(read('')).toEqual({
      query: '',
      filters: EMPTY_FILTERS,
      sort: { key: 'updatedAt', direction: 'desc' },
      page: 1,
      perPage: 10,
    });
  });

  it('gives an untouched list a clean URL', () => {
    expect(writeSearchState().toString()).toBe('');
    expect(writeSearchState(read('')).toString()).toBe('');
  });

  it('keeps the search text, every filter, the order and the page', () => {
    const state = {
      query: 'فيلا pool',
      filters: {
        ...EMPTY_FILTERS,
        cities: ['Riyadh', 'Jeddah'],
        statuses: ['Vacant'],
        amenities: ['pool', 'garage'],
        propertyType: 'Duplex',
        minBedrooms: '3',
        rentFrom: '50000',
        rentTo: '150000',
        sizeFrom: '200',
        sizeTo: '900',
      },
      sort: { key: 'yearlyRentSar', direction: 'asc' },
      page: 3,
      perPage: 25,
    };

    expect(read(writeSearchState(state).toString())).toEqual(state);
  });

  it('repeats a parameter for a filter with several values', () => {
    const params = writeSearchState({
      filters: { ...EMPTY_FILTERS, cities: ['Riyadh', 'Jeddah'] },
    });

    expect(params.getAll('city')).toEqual(['Riyadh', 'Jeddah']);
  });

  it('drops what a hand-edited URL gets wrong, so the list still works', () => {
    const state = read(
      'city=Paris&city=Riyadh&status=Sold&type=Castle&amenity=moat' +
        '&sort=colour&dir=up&page=abc&per=7',
    );

    expect(state.filters.cities).toEqual(['Riyadh']);
    expect(state.filters.statuses).toEqual([]);
    expect(state.filters.propertyType).toBe('');
    expect(state.filters.amenities).toEqual([]);
    expect(state.sort).toEqual({ key: 'updatedAt', direction: 'desc' });
    expect(state.page).toBe(1);
    expect(state.perPage).toBe(10);
  });

  it('never reads a page before page 1', () => {
    expect(read('page=0').page).toBe(1);
  });
});
