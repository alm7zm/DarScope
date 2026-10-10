/**
 * Shared test data. Every test starts from a fresh copy so that tests never affect each other
 * (testing rules). Build properties with `makeProperty`, never by copying an object between tests.
 */
import { emptyAmenities } from '../constants/options.js';

/** An Arabic district name, for the Arabic search and direction tests (FR-SRC-08, FR-LST-07). */
export const ARABIC_DISTRICT = '\u0627\u0644\u0645\u0644\u0642\u0627';

/** A valid set of form values, with every required field filled and no tenancy details. */
export function validValues(overrides = {}) {
  return {
    city: 'Riyadh',
    district: 'Al Malqa',
    front: 'North',
    propertyType: 'Villa',
    sizeSqm: 450,
    propertyAgeYears: 5,
    bedrooms: 4,
    bathrooms: 3,
    livingRooms: 2,
    amenities: emptyAmenities(),
    yearlyRentSar: 120000,
    description: 'A family villa close to the ring road.',
    status: 'Vacant',
    tenantName: '',
    leaseStart: '',
    leaseEnd: '',
    ...overrides,
  };
}

/** A stored property: valid values plus the fields the app sets itself (SRS 3.1). */
export function makeProperty(overrides = {}) {
  return {
    id: 'RP-0001',
    ...validValues(),
    createdAt: '2026-01-15T09:30:00.000Z',
    updatedAt: '2026-01-15T09:30:00.000Z',
    ...overrides,
  };
}

/**
 * A small portfolio that covers what the list, search and dashboard tests need: all four cities,
 * both types, all three statuses, and one Arabic district.
 * @returns {Array<Record<string, unknown>>} A fresh array of fresh objects.
 */
export function makePortfolio() {
  return [
    makeProperty({
      id: 'RP-0001',
      city: 'Riyadh',
      district: 'Al Malqa',
      propertyType: 'Villa',
      sizeSqm: 450,
      bedrooms: 4,
      yearlyRentSar: 120000,
      status: 'Vacant',
      updatedAt: '2026-01-10T09:00:00.000Z',
    }),
    makeProperty({
      id: 'RP-0002',
      city: 'Jeddah',
      district: ARABIC_DISTRICT,
      propertyType: 'Duplex',
      sizeSqm: 300,
      bedrooms: 3,
      yearlyRentSar: 85000,
      status: 'Occupied',
      tenantName: 'Nora Al Harbi',
      leaseStart: '2026-01-01',
      leaseEnd: '2026-12-31',
      description: 'Close to the sea, with a pool.',
      amenities: { ...emptyAmenities(), pool: true, ac: true },
      updatedAt: '2026-01-12T09:00:00.000Z',
    }),
    makeProperty({
      id: 'RP-0003',
      city: 'Dammam',
      district: 'Al Faisaliyah',
      propertyType: 'Villa',
      sizeSqm: 600,
      bedrooms: 6,
      yearlyRentSar: 200000,
      status: 'Under maintenance',
      updatedAt: '2026-01-14T09:00:00.000Z',
    }),
    makeProperty({
      id: 'RP-0004',
      city: 'Al Khobar',
      district: 'Al Aqrabiyah',
      propertyType: 'Duplex',
      sizeSqm: 220,
      bedrooms: 2,
      yearlyRentSar: 60000,
      status: 'Vacant',
      updatedAt: '2026-01-08T09:00:00.000Z',
    }),
  ];
}
