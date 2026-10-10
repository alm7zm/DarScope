/**
 * The Dashboard figures (SRS 4.2), as pure functions over the portfolio. Nothing here is stored:
 * every figure is calculated from the collection whenever it is needed, which is what makes
 * FR-DSH-03 true for free — an add, update, delete or reset changes the collection, and the
 * figures follow in the same render.
 */
import { CITIES } from '../constants/options.js';

/**
 * @typedef {{
 *   total: number,
 *   occupied: number,
 *   vacant: number,
 *   maintenance: number,
 *   occupancyRate: number | null,
 *   rentFromOccupied: number,
 *   potentialRent: number,
 * }} PortfolioSummary
 */

/** Add up a field over a list of properties, ignoring anything that is not a number. */
function sum(properties, field) {
  return properties.reduce(
    (total, property) =>
      total + (Number.isFinite(property[field]) ? property[field] : 0),
    0,
  );
}

/**
 * Every headline figure the Dashboard shows (FR-DSH-01, FR-DSH-02).
 * @param {Array<Record<string, unknown>>} properties
 * @returns {PortfolioSummary} `occupancyRate` is null for an empty portfolio, which the page
 *   shows as a dash rather than as 0% (FR-DSH-02).
 */
export function summarise(properties = []) {
  const occupiedProperties = properties.filter(
    (property) => property.status === 'Occupied',
  );
  const total = properties.length;

  return {
    total,
    occupied: occupiedProperties.length,
    vacant: properties.filter((property) => property.status === 'Vacant')
      .length,
    maintenance: properties.filter(
      (property) => property.status === 'Under maintenance',
    ).length,
    // A whole percentage, and nothing at all to divide by when the portfolio is empty.
    occupancyRate:
      total === 0
        ? null
        : Math.round((occupiedProperties.length / total) * 100),
    rentFromOccupied: sum(occupiedProperties, 'yearlyRentSar'),
    potentialRent: sum(properties, 'yearlyRentSar'),
  };
}

/**
 * One row per city that has at least one property: how many, how many occupied, and the total
 * yearly rent (FR-DSH-05). Cities keep the order of `CITIES`, so the table does not reshuffle as
 * properties are added and removed.
 * @param {Array<Record<string, unknown>>} properties
 * @returns {Array<{ city: string, total: number, occupied: number, rent: number }>}
 */
export function byCity(properties = []) {
  return CITIES.map((city) => {
    const inCity = properties.filter((property) => property.city === city);
    return {
      city,
      total: inCity.length,
      occupied: inCity.filter((property) => property.status === 'Occupied')
        .length,
      rent: sum(inCity, 'yearlyRentSar'),
    };
  }).filter((row) => row.total > 0);
}

/**
 * The properties earning nothing right now: Vacant or Under maintenance (FR-DSH-06). Under
 * maintenance comes first, because it needs work before it can be let at all.
 * @param {Array<Record<string, unknown>>} properties
 * @returns {Array<Record<string, unknown>>} A new array; the input is not reordered.
 */
export function needsAttention(properties = []) {
  const order = { 'Under maintenance': 0, Vacant: 1 };
  return properties
    .filter((property) => property.status in order)
    .toSorted((a, b) => order[a.status] - order[b.status]);
}
