import { describe, expect, it } from 'vitest';
import { makePortfolio, makeProperty } from '../test/fixtures.js';
import { byCity, needsAttention, summarise } from './stats.js';

describe('summarise: the headline figures (FR-DSH-01)', () => {
  it('counts the portfolio and each status', () => {
    // The fixture holds one Occupied, two Vacant and one Under maintenance.
    const summary = summarise(makePortfolio());

    expect(summary.total).toBe(4);
    expect(summary.occupied).toBe(1);
    expect(summary.vacant).toBe(2);
    expect(summary.maintenance).toBe(1);
  });

  it('adds up rent from occupied properties, and from all of them', () => {
    const properties = [
      makeProperty({
        id: 'RP-0001',
        status: 'Occupied',
        yearlyRentSar: 100000,
      }),
      makeProperty({ id: 'RP-0002', status: 'Vacant', yearlyRentSar: 60000 }),
      makeProperty({
        id: 'RP-0003',
        status: 'Under maintenance',
        yearlyRentSar: 40000,
      }),
    ];

    const summary = summarise(properties);
    expect(summary.rentFromOccupied).toBe(100000);
    expect(summary.potentialRent).toBe(200000);
  });

  it('every status is counted exactly once', () => {
    const summary = summarise(makePortfolio());
    expect(summary.occupied + summary.vacant + summary.maintenance).toBe(
      summary.total,
    );
  });
});

describe('summarise: the occupancy rate (FR-DSH-02)', () => {
  const occupied = (count, total) =>
    Array.from({ length: total }, (_unused, index) =>
      makeProperty({
        id: `RP-${index}`,
        status: index < count ? 'Occupied' : 'Vacant',
      }),
    );

  it('is occupied divided by total, as a whole percentage', () => {
    expect(summarise(occupied(1, 2)).occupancyRate).toBe(50);
    expect(summarise(occupied(1, 4)).occupancyRate).toBe(25);
    expect(summarise(occupied(4, 4)).occupancyRate).toBe(100);
    expect(summarise(occupied(0, 4)).occupancyRate).toBe(0);
  });

  it('rounds to a whole number rather than showing a fraction', () => {
    // 1 of 3 is 33.33…%
    expect(summarise(occupied(1, 3)).occupancyRate).toBe(33);
    // 2 of 3 is 66.66…%
    expect(summarise(occupied(2, 3)).occupancyRate).toBe(67);
  });

  it('is null for an empty portfolio, so the page can show a dash', () => {
    expect(summarise([]).occupancyRate).toBeNull();
    expect(summarise().occupancyRate).toBeNull();
  });
});

describe('summarise: an empty portfolio (FR-DSH-04)', () => {
  it('reports zeros rather than failing', () => {
    expect(summarise([])).toEqual({
      total: 0,
      occupied: 0,
      vacant: 0,
      maintenance: 0,
      occupancyRate: null,
      rentFromOccupied: 0,
      potentialRent: 0,
    });
  });
});

describe('summarise: odd data', () => {
  it('ignores a rent that is not a number', () => {
    const properties = [
      makeProperty({ id: 'RP-0001', status: 'Occupied', yearlyRentSar: null }),
      makeProperty({
        id: 'RP-0002',
        status: 'Occupied',
        yearlyRentSar: 50000,
      }),
    ];
    expect(summarise(properties).rentFromOccupied).toBe(50000);
  });

  it('changes nothing about the properties it was given', () => {
    const properties = makePortfolio();
    const before = structuredClone(properties);
    summarise(properties);
    expect(properties).toEqual(before);
  });
});

describe('byCity (FR-DSH-05)', () => {
  it('reports properties, occupied properties and rent for each city', () => {
    const properties = [
      makeProperty({
        id: 'RP-0001',
        city: 'Riyadh',
        status: 'Occupied',
        yearlyRentSar: 100000,
      }),
      makeProperty({
        id: 'RP-0002',
        city: 'Riyadh',
        status: 'Vacant',
        yearlyRentSar: 80000,
      }),
      makeProperty({
        id: 'RP-0003',
        city: 'Jeddah',
        status: 'Occupied',
        yearlyRentSar: 60000,
      }),
    ];

    expect(byCity(properties)).toEqual([
      { city: 'Riyadh', total: 2, occupied: 1, rent: 180000 },
      { city: 'Jeddah', total: 1, occupied: 1, rent: 60000 },
    ]);
  });

  it('leaves out a city with no properties', () => {
    const properties = [makeProperty({ city: 'Dammam' })];
    expect(byCity(properties).map((row) => row.city)).toEqual(['Dammam']);
  });

  it('keeps the city order fixed, so the table does not reshuffle', () => {
    const properties = [
      makeProperty({ id: 'RP-0001', city: 'Al Khobar' }),
      makeProperty({ id: 'RP-0002', city: 'Riyadh' }),
    ];
    // Riyadh comes before Al Khobar in the list of cities, whatever order they arrive in.
    expect(byCity(properties).map((row) => row.city)).toEqual([
      'Riyadh',
      'Al Khobar',
    ]);
  });

  it('returns nothing for an empty portfolio', () => {
    expect(byCity([])).toEqual([]);
  });
});

describe('needsAttention (FR-DSH-06)', () => {
  it('lists the properties that are earning nothing', () => {
    const properties = makePortfolio();
    const ids = needsAttention(properties).map((property) => property.id);

    // RP-0002 is Occupied, so it is not here.
    expect(ids).not.toContain('RP-0002');
    expect(ids).toContain('RP-0001');
    expect(ids).toContain('RP-0003');
    expect(ids).toContain('RP-0004');
  });

  it('puts Under maintenance before Vacant, since it cannot be let at all', () => {
    const statuses = needsAttention(makePortfolio()).map(
      (property) => property.status,
    );
    expect(statuses[0]).toBe('Under maintenance');
  });

  it('is empty when every property is occupied', () => {
    const properties = [makeProperty({ status: 'Occupied' })];
    expect(needsAttention(properties)).toEqual([]);
  });

  it('does not reorder the portfolio it was given', () => {
    const properties = makePortfolio();
    const before = properties.map((property) => property.id);
    needsAttention(properties);
    expect(properties.map((property) => property.id)).toEqual(before);
  });
});
