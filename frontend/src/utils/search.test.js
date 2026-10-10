import { describe, expect, it } from 'vitest';
import { emptyAmenities } from '../constants/options.js';
import {
  ARABIC_DISTRICT,
  makePortfolio,
  makeProperty,
} from '../test/fixtures.js';
import {
  EMPTY_FILTERS,
  isSearchActive,
  matchesFilters,
  matchesKeywords,
  searchProperties,
  searchableText,
} from './search.js';

/** The IDs the search returns, which is what the list shows. */
function ids(properties) {
  return properties.map((property) => property.id);
}

describe('searchableText (FR-SRC-02)', () => {
  it('covers ID, city, district, type, status, tenant name and description', () => {
    const property = makeProperty({
      id: 'RP-0012',
      city: 'Jeddah',
      district: 'Al Hamra',
      propertyType: 'Duplex',
      status: 'Occupied',
      tenantName: 'Nora Al Harbi',
      description: 'Close to the corniche',
    });

    const text = searchableText(property);
    for (const word of [
      'rp-0012',
      'jeddah',
      'al hamra',
      'duplex',
      'occupied',
      'nora al harbi',
      'corniche',
    ]) {
      expect(text).toContain(word);
    }
  });

  it('includes the labels of the amenities the property has, and no others', () => {
    const property = makeProperty({
      amenities: { ...emptyAmenities(), pool: true },
      description: '',
    });

    const text = searchableText(property);
    expect(text).toContain('pool');
    expect(text).not.toContain('elevator');
  });
});

describe('matchesKeywords (FR-SRC-02)', () => {
  const property = makeProperty({
    id: 'RP-0012',
    city: 'Riyadh',
    district: 'Al Malqa',
    propertyType: 'Villa',
    status: 'Vacant',
    description: 'Family home with a garden',
    amenities: { ...emptyAmenities(), pool: true },
  });

  it('keeps everything when nothing is typed', () => {
    expect(matchesKeywords(property, '')).toBe(true);
    expect(matchesKeywords(property, '   ')).toBe(true);
  });

  it('ignores letter case', () => {
    expect(matchesKeywords(property, 'RIYADH')).toBe(true);
    expect(matchesKeywords(property, 'riyadh')).toBe(true);
  });

  it('requires every word, though they may be in different fields', () => {
    // The SRS example: "riyadh villa" finds villas in Riyadh.
    expect(matchesKeywords(property, 'riyadh villa')).toBe(true);
    expect(matchesKeywords(property, 'riyadh duplex')).toBe(false);
  });

  it('finds a property by its ID', () => {
    expect(matchesKeywords(property, 'rp-0012')).toBe(true);
    expect(matchesKeywords(property, 'RP-0012')).toBe(true);
    expect(matchesKeywords(property, 'rp-0013')).toBe(false);
  });

  it('finds a property by an amenity it has', () => {
    expect(matchesKeywords(property, 'pool')).toBe(true);
    expect(matchesKeywords(property, 'elevator')).toBe(false);
  });

  it('finds a property by a word in its description', () => {
    expect(matchesKeywords(property, 'garden')).toBe(true);
  });

  it('matches part of a word, so a half-typed search still finds things', () => {
    expect(matchesKeywords(property, 'riya')).toBe(true);
  });
});

describe('matchesKeywords: Arabic (FR-SRC-08, FR-SRC-11)', () => {
  const arabic = makeProperty({ district: ARABIC_DISTRICT });

  it('finds a property by its Arabic district', () => {
    expect(matchesKeywords(arabic, ARABIC_DISTRICT)).toBe(true);
  });

  it('matches a spelling variant of the same Arabic word (Appendix B.4)', () => {
    // الروضة and الروضه differ only in the final letter.
    const rawdah = makeProperty({
      district: 'الروضة',
    });
    expect(matchesKeywords(rawdah, 'الروضه')).toBe(true);
  });

  it('matches an Arabic word written with a different alif', () => {
    const ahmed = makeProperty({
      status: 'Occupied',
      tenantName: 'أحمد العلي',
    });
    expect(matchesKeywords(ahmed, 'احمد')).toBe(true);
  });

  it('ignores Arabic diacritics in the text and in the query', () => {
    const withMarks = makeProperty({
      district: 'المَلْقا',
    });
    expect(matchesKeywords(withMarks, 'الملقا')).toBe(true);
  });
});

describe('matchesFilters (FR-SRC-04)', () => {
  const property = makeProperty({
    city: 'Riyadh',
    status: 'Vacant',
    propertyType: 'Villa',
    yearlyRentSar: 120000,
    sizeSqm: 450,
    bedrooms: 4,
  });

  it('lets everything through when no filter is set', () => {
    expect(matchesFilters(property, EMPTY_FILTERS)).toBe(true);
    expect(matchesFilters(property)).toBe(true);
  });

  it('filters by one or more cities', () => {
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, cities: ['Riyadh'] }),
    ).toBe(true);
    expect(
      matchesFilters(property, {
        ...EMPTY_FILTERS,
        cities: ['Jeddah', 'Riyadh'],
      }),
    ).toBe(true);
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, cities: ['Jeddah'] }),
    ).toBe(false);
  });

  it('filters by one or more statuses', () => {
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, statuses: ['Vacant'] }),
    ).toBe(true);
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, statuses: ['Occupied'] }),
    ).toBe(false);
  });

  it('filters by type', () => {
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, propertyType: 'Villa' }),
    ).toBe(true);
    expect(
      matchesFilters(property, { ...EMPTY_FILTERS, propertyType: 'Duplex' }),
    ).toBe(false);
  });

  it('filters by a rent range, inclusive at both ends', () => {
    const rent = (rentFrom, rentTo) =>
      matchesFilters(property, { ...EMPTY_FILTERS, rentFrom, rentTo });

    expect(rent('120000', '120000')).toBe(true);
    expect(rent('100000', '150000')).toBe(true);
    expect(rent('130000', '')).toBe(false);
    expect(rent('', '100000')).toBe(false);
    // One open end still works.
    expect(rent('100000', '')).toBe(true);
    expect(rent('', '150000')).toBe(true);
  });

  it('filters by a size range, inclusive at both ends', () => {
    const size = (sizeFrom, sizeTo) =>
      matchesFilters(property, { ...EMPTY_FILTERS, sizeFrom, sizeTo });

    expect(size('450', '450')).toBe(true);
    expect(size('500', '')).toBe(false);
    expect(size('', '400')).toBe(false);
  });

  it('filters by a minimum number of bedrooms', () => {
    const atLeast = (minBedrooms) =>
      matchesFilters(property, { ...EMPTY_FILTERS, minBedrooms });

    expect(atLeast('4')).toBe(true);
    expect(atLeast('3')).toBe(true);
    expect(atLeast('5')).toBe(false);
    expect(atLeast('')).toBe(true);
  });

  it('does not apply a range it was told to skip (FR-SRC-07)', () => {
    const impossible = {
      ...EMPTY_FILTERS,
      rentFrom: '200000',
      rentTo: '100000',
    };

    expect(matchesFilters(property, impossible)).toBe(false);
    expect(matchesFilters(property, impossible, { rent: true })).toBe(true);
  });
});

describe('searchProperties: everything combines with AND (FR-SRC-05)', () => {
  it('AC-11 city, status and minimum bedrooms together', () => {
    const portfolio = makePortfolio();

    const result = searchProperties(portfolio, {
      filters: {
        ...EMPTY_FILTERS,
        cities: ['Riyadh'],
        statuses: ['Vacant'],
        minBedrooms: '4',
      },
    });

    expect(ids(result)).toEqual(['RP-0001']);
  });

  it('applies the search box and the filters at the same time', () => {
    const portfolio = makePortfolio();

    const result = searchProperties(portfolio, {
      query: 'villa',
      filters: { ...EMPTY_FILTERS, cities: ['Dammam'] },
    });

    expect(ids(result)).toEqual(['RP-0003']);
  });

  it('AC-09 narrows by city name typed in the box', () => {
    const portfolio = makePortfolio();
    const result = searchProperties(portfolio, { query: 'jeddah' });

    expect(ids(result)).toEqual(['RP-0002']);
  });

  it('AC-10 narrows by an Arabic district typed in the box', () => {
    const portfolio = makePortfolio();
    const result = searchProperties(portfolio, { query: ARABIC_DISTRICT });

    expect(ids(result)).toEqual(['RP-0002']);
  });

  it('AC-12 returns nothing when nothing matches', () => {
    const portfolio = makePortfolio();
    expect(searchProperties(portfolio, { query: 'zzzz' })).toEqual([]);
  });

  it('returns everything when nothing is typed or set', () => {
    const portfolio = makePortfolio();
    expect(searchProperties(portfolio)).toHaveLength(portfolio.length);
  });

  it('keeps the order it was given', () => {
    const portfolio = makePortfolio();
    expect(ids(searchProperties(portfolio))).toEqual(ids(portfolio));
  });

  it('changes nothing about the properties themselves', () => {
    const portfolio = makePortfolio();
    const before = structuredClone(portfolio);
    searchProperties(portfolio, { query: 'villa' });
    expect(portfolio).toEqual(before);
  });
});

describe('isSearchActive (FR-LST-05)', () => {
  it('is false when nothing is typed and no filter is set', () => {
    expect(isSearchActive()).toBe(false);
    expect(isSearchActive({ query: '', filters: EMPTY_FILTERS })).toBe(false);
    expect(isSearchActive({ query: '   ' })).toBe(false);
  });

  it('is true once something is typed', () => {
    expect(isSearchActive({ query: 'riyadh' })).toBe(true);
  });

  it.each([
    ['cities', ['Riyadh']],
    ['statuses', ['Vacant']],
    ['propertyType', 'Villa'],
    ['rentFrom', '1000'],
    ['rentTo', '5000'],
    ['sizeFrom', '100'],
    ['sizeTo', '900'],
    ['minBedrooms', '3'],
  ])('is true once %s is set', (key, value) => {
    expect(
      isSearchActive({ filters: { ...EMPTY_FILTERS, [key]: value } }),
    ).toBe(true);
  });
});
