import { describe, expect, it } from 'vitest';
import {
  displayTitle,
  formatAge,
  formatCount,
  formatDate,
  formatDateTime,
  formatRent,
  formatSize,
} from './format.js';

describe('formatRent (FR-LST-06)', () => {
  it('groups thousands and names the currency', () => {
    expect(formatRent(120000)).toBe('120,000 SAR');
    expect(formatRent(1000)).toBe('1,000 SAR');
    expect(formatRent(10000000)).toBe('10,000,000 SAR');
  });

  it.each([null, undefined, 'abc', NaN])('shows a dash for %j', (value) => {
    expect(formatRent(value)).toBe('—');
  });
});

describe('formatSize (FR-LST-06)', () => {
  it('adds the unit', () => {
    expect(formatSize(450)).toBe('450 m²');
    expect(formatSize(100000)).toBe('100,000 m²');
  });

  it('shows a dash when there is no number', () => {
    expect(formatSize(undefined)).toBe('—');
  });
});

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(1350)).toBe('1,350');
    expect(formatCount(0)).toBe('0');
  });
});

describe('formatAge', () => {
  it('calls a brand new property New (SRS 3.1)', () => {
    expect(formatAge(0)).toBe('New');
  });

  it('writes one year in the singular', () => {
    expect(formatAge(1)).toBe('1 year');
    expect(formatAge(12)).toBe('12 years');
  });
});

describe('formatDate', () => {
  it('writes a lease date in full', () => {
    expect(formatDate('2026-01-15')).toBe('15 January 2026');
    expect(formatDate('2026-12-01')).toBe('1 December 2026');
  });

  it('reads the day straight from the string, so the date never shifts by a time zone', () => {
    // A Date would make this UTC midnight, which is the previous day west of UTC.
    expect(formatDate('2026-03-01')).toBe('1 March 2026');
  });

  it.each([null, undefined, '', 'not a date', '2026-13-01'])(
    'shows a dash for %j',
    (value) => {
      expect(formatDate(value)).toBe('—');
    },
  );
});

describe('formatDateTime', () => {
  it('writes a timestamp in UTC', () => {
    expect(formatDateTime('2026-01-15T09:30:00.000Z')).toBe(
      '15 January 2026, 09:30 UTC',
    );
  });

  it('pads single-digit hours and minutes', () => {
    expect(formatDateTime('2026-01-15T07:05:00.000Z')).toBe(
      '15 January 2026, 07:05 UTC',
    );
  });

  it.each([null, undefined, 'not a date'])('shows a dash for %j', (value) => {
    expect(formatDateTime(value)).toBe('—');
  });
});

describe('displayTitle (SRS 3.5)', () => {
  it('reads "Type in district, city"', () => {
    expect(
      displayTitle({
        propertyType: 'Villa',
        district: 'Al Malqa',
        city: 'Riyadh',
      }),
    ).toBe('Villa in Al Malqa, Riyadh');
  });

  it('keeps an Arabic district as it was written', () => {
    expect(
      displayTitle({
        propertyType: 'Duplex',
        district: '\u0627\u0644\u0645\u0644\u0642\u0627',
        city: 'Riyadh',
      }),
    ).toBe('Duplex in \u0627\u0644\u0645\u0644\u0642\u0627, Riyadh');
  });
});
