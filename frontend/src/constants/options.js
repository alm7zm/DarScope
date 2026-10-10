/**
 * Every fixed list of choices in the app (SRS 3.1, 3.2 and A.3). Components and the validator
 * read them from here and never repeat them (NFR-MNT-04).
 */

/** The four cities the company operates in (SRS 3.1). */
export const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Al Khobar'];

/** The only two kinds of asset the app manages (SRS 1.3). Villa is the default. */
export const PROPERTY_TYPES = ['Villa', 'Duplex'];

/** Tenancy state of a property (SRS 3.1). Vacant is the default. */
export const STATUSES = ['Vacant', 'Occupied', 'Under maintenance'];

/** Which way the property faces. Optional, so an empty value is allowed (SRS 3.1). */
export const FRONTS = [
  'North',
  'South',
  'East',
  'West',
  'Northeast',
  'Northwest',
  'Southeast',
  'Southwest',
  'Three streets',
  'Four streets',
];

/**
 * The 13 amenity flags in SRS 3.2, each with the label shown in the interface. The order is the
 * order they appear in on the form and the detail page.
 * @type {ReadonlyArray<{ key: string, label: string }>}
 */
export const AMENITIES = [
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'garage', label: 'Garage' },
  { key: 'driverRoom', label: "Driver's room" },
  { key: 'maidRoom', label: "Maid's room" },
  { key: 'furnished', label: 'Furnished' },
  { key: 'ac', label: 'Air conditioning' },
  { key: 'roof', label: 'Roof space' },
  { key: 'pool', label: 'Pool' },
  { key: 'frontyard', label: 'Front yard' },
  { key: 'basement', label: 'Basement' },
  { key: 'stairs', label: 'Stairs' },
  { key: 'elevator', label: 'Elevator' },
  { key: 'fireplace', label: 'Fireplace' },
];

/** The 13 amenity keys, for building and checking an amenities object. */
export const AMENITY_KEYS = AMENITIES.map((amenity) => amenity.key);

/** An amenities object with all 13 flags set to no, the default for a new property (FR-ADD-09). */
export function emptyAmenities() {
  return Object.fromEntries(AMENITY_KEYS.map((key) => [key, false]));
}

/** The inclusive range of every number field (SRS 3.1). The validator is the only reader. */
export const RANGES = {
  sizeSqm: { min: 20, max: 100000 },
  propertyAgeYears: { min: 0, max: 100 },
  bedrooms: { min: 0, max: 20 },
  bathrooms: { min: 0, max: 20 },
  livingRooms: { min: 0, max: 20 },
  yearlyRentSar: { min: 1000, max: 10000000 },
};

/** Text length limits (SRS 3.1). */
export const LENGTHS = {
  district: { min: 2, max: 60 },
  tenantName: { min: 2, max: 80 },
  description: { max: 2000 },
};
