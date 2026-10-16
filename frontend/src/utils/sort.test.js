import { describe, expect, it } from 'vitest';
import { makeProperty } from '../test/fixtures.js';
import {
  DEFAULT_SORT,
  PAGE_SIZES,
  SORT_OPTIONS,
  paginate,
  sortProperties,
} from './sort.js';

/** The IDs in the order the list shows them. */
function ids(properties) {
  return properties.map((property) => property.id);
}

/** Three properties that differ on every field the list sorts by. */
function makeThree() {
  return [
    makeProperty({
      id: 'RP-0001',
      city: 'Riyadh',
      yearlyRentSar: 120000,
      sizeSqm: 450,
      bedrooms: 4,
      updatedAt: '2026-02-01T08:00:00.000Z',
    }),
    makeProperty({
      id: 'RP-0002',
      city: 'Al Khobar',
      yearlyRentSar: 90000,
      sizeSqm: 600,
      bedrooms: 6,
      updatedAt: '2026-03-01T08:00:00.000Z',
    }),
    makeProperty({
      id: 'RP-0003',
      city: 'Jeddah',
      yearlyRentSar: 150000,
      sizeSqm: 300,
      bedrooms: 3,
      updatedAt: '2026-01-01T08:00:00.000Z',
    }),
  ];
}

describe('sortProperties (FR-SRC-09)', () => {
  it('offers Yearly rent, Size, Bedrooms, City and Last updated', () => {
    expect(SORT_OPTIONS.map((option) => option.label).sort()).toEqual([
      'Bedrooms',
      'City',
      'Last updated',
      'Size',
      'Yearly rent',
    ]);
  });

  it('sorts by Last updated, newest first, by default', () => {
    expect(DEFAULT_SORT).toEqual({ key: 'updatedAt', direction: 'desc' });
    expect(ids(sortProperties(makeThree()))).toEqual([
      'RP-0002',
      'RP-0001',
      'RP-0003',
    ]);
  });

  it.each([
    ['yearlyRentSar', ['RP-0002', 'RP-0001', 'RP-0003']],
    ['sizeSqm', ['RP-0003', 'RP-0001', 'RP-0002']],
    ['bedrooms', ['RP-0003', 'RP-0001', 'RP-0002']],
    ['city', ['RP-0002', 'RP-0003', 'RP-0001']],
    ['updatedAt', ['RP-0003', 'RP-0001', 'RP-0002']],
  ])('sorts by %s ascending, and descending in reverse', (key, ascending) => {
    const properties = makeThree();

    expect(ids(sortProperties(properties, { key, direction: 'asc' }))).toEqual(
      ascending,
    );
    expect(ids(sortProperties(properties, { key, direction: 'desc' }))).toEqual(
      [...ascending].reverse(),
    );
  });

  it('breaks a tie by ID, so two runs never swap rows', () => {
    const properties = ['RP-0003', 'RP-0001', 'RP-0002'].map((id) =>
      makeProperty({ id, yearlyRentSar: 100000 }),
    );

    for (const direction of ['asc', 'desc']) {
      expect(
        ids(sortProperties(properties, { key: 'yearlyRentSar', direction })),
      ).toEqual(['RP-0001', 'RP-0002', 'RP-0003']);
    }
  });

  it('puts a property without the value last, in either direction', () => {
    const properties = [
      makeProperty({ id: 'RP-0001', yearlyRentSar: 100000 }),
      makeProperty({ id: 'RP-0002', yearlyRentSar: undefined }),
      makeProperty({ id: 'RP-0003', yearlyRentSar: 200000 }),
    ];
    const sorted = (direction) =>
      ids(sortProperties(properties, { key: 'yearlyRentSar', direction }));

    expect(sorted('asc')).toEqual(['RP-0001', 'RP-0003', 'RP-0002']);
    expect(sorted('desc')).toEqual(['RP-0003', 'RP-0001', 'RP-0002']);
  });

  it('falls back to the default order for a field it does not know', () => {
    const properties = makeThree();

    expect(
      ids(sortProperties(properties, { key: 'colour', direction: 'desc' })),
    ).toEqual(ids(sortProperties(properties)));
  });

  it('returns a new array and leaves the collection as it was (NFR-REL-04)', () => {
    const properties = makeThree();
    const before = structuredClone(properties);

    const sorted = sortProperties(properties, {
      key: 'sizeSqm',
      direction: 'asc',
    });

    expect(sorted).not.toBe(properties);
    expect(properties).toEqual(before);
  });
});

describe('paginate (FR-LST-10)', () => {
  /** 25 items, numbered 1 to 25. */
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  /** The numbers from `from` to `to`, inclusive. */
  function numbers(from, to) {
    return Array.from({ length: to - from + 1 }, (_, index) => from + index);
  }

  it('offers 10, 25 or 50 properties per page, 10 by default', () => {
    expect(PAGE_SIZES).toEqual([10, 25, 50]);
    expect(paginate(items).items).toEqual(numbers(1, 10));
  });

  it('shows the second page of 10', () => {
    expect(paginate(items, { page: 2 })).toEqual({
      items: numbers(11, 20),
      page: 2,
      pageCount: 3,
      from: 11,
      to: 20,
    });
  });

  it('shows what is left on the last page', () => {
    expect(paginate(items, { page: 3 })).toEqual({
      items: numbers(21, 25),
      page: 3,
      pageCount: 3,
      from: 21,
      to: 25,
    });
  });

  it('shows the last page for a page past the end, and page 1 for one before it', () => {
    expect(paginate(items, { page: 9 }).page).toBe(3);
    expect(paginate(items, { page: 0 }).page).toBe(1);
  });

  it('fits all 25 on one page of 25 or 50', () => {
    for (const perPage of [25, 50]) {
      expect(paginate(items, { perPage })).toMatchObject({
        page: 1,
        pageCount: 1,
        from: 1,
        to: 25,
      });
    }
  });

  it('has one empty page when nothing matches', () => {
    expect(paginate([])).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      from: 0,
      to: 0,
    });
  });
});
