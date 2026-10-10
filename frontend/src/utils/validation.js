/**
 * Every field check in SRS Appendix C.1, as pure functions. The form calls them to show errors
 * beside each field (FR-ADD-03) and the data service calls them again to reject invalid input, so
 * no invalid property can enter the portfolio (NFR-REL-03).
 */
import { FIELD_ERRORS } from '../constants/messages.js';
import {
  AMENITY_KEYS,
  CITIES,
  FRONTS,
  LENGTHS,
  PROPERTY_TYPES,
  RANGES,
  STATUSES,
  emptyAmenities,
} from '../constants/options.js';

/** Fields that are cleared unless the status is Occupied (SRS 3.1, FR-UPD-07). */
export const TENANCY_FIELDS = ['tenantName', 'leaseStart', 'leaseEnd'];

/**
 * Read a value that must be a whole number. Form inputs arrive as strings, so digits-only text
 * counts (FR-ADD-12); anything else, including a decimal, does not.
 * @param {unknown} value
 * @returns {number | null} The number, or null when the value is not a whole number.
 */
export function toWholeNumber(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : null;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

/** Trim text, treating a missing value as empty. */
function trimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Check one whole-number field that has a single message for "not a number" and "out of range",
 * which is how Appendix C words age, bedrooms, bathrooms and living rooms.
 */
function checkRange(value, { min, max }, message) {
  const number = toWholeNumber(value);
  if (number === null || number < min || number > max) return message;
  return undefined;
}

/**
 * Check every field of a property against SRS Appendix C.1, in the order the appendix lists them.
 * @param {Record<string, unknown>} values The field values, as the form holds them.
 * @returns {Record<string, string>} One message per invalid field. Empty when everything passes.
 */
export function validateProperty(values = {}) {
  /** @type {Record<string, string>} */
  const errors = {};

  if (!CITIES.includes(values.city)) {
    errors.city = FIELD_ERRORS.cityRequired;
  }

  const district = trimmed(values.district);
  if (district === '') {
    errors.district = FIELD_ERRORS.districtRequired;
  } else if (
    district.length < LENGTHS.district.min ||
    district.length > LENGTHS.district.max
  ) {
    errors.district = FIELD_ERRORS.districtLength;
  }

  if (!PROPERTY_TYPES.includes(values.propertyType)) {
    errors.propertyType = FIELD_ERRORS.propertyTypeRequired;
  }

  // Size and rent are the two fields Appendix C gives a separate "whole number" message to.
  const size = toWholeNumber(values.sizeSqm);
  if (size === null) {
    errors.sizeSqm = FIELD_ERRORS.sizeWholeNumber;
  } else if (size < RANGES.sizeSqm.min || size > RANGES.sizeSqm.max) {
    errors.sizeSqm = FIELD_ERRORS.sizeRange;
  }

  const ageError = checkRange(
    values.propertyAgeYears,
    RANGES.propertyAgeYears,
    FIELD_ERRORS.propertyAgeRange,
  );
  if (ageError) errors.propertyAgeYears = ageError;

  const bedroomsError = checkRange(
    values.bedrooms,
    RANGES.bedrooms,
    FIELD_ERRORS.bedroomsRange,
  );
  if (bedroomsError) errors.bedrooms = bedroomsError;

  const bathroomsError = checkRange(
    values.bathrooms,
    RANGES.bathrooms,
    FIELD_ERRORS.bathroomsRange,
  );
  if (bathroomsError) errors.bathrooms = bathroomsError;

  const livingRoomsError = checkRange(
    values.livingRooms,
    RANGES.livingRooms,
    FIELD_ERRORS.livingRoomsRange,
  );
  if (livingRoomsError) errors.livingRooms = livingRoomsError;

  const rent = toWholeNumber(values.yearlyRentSar);
  if (rent === null) {
    errors.yearlyRentSar = FIELD_ERRORS.rentWholeNumber;
  } else if (
    rent < RANGES.yearlyRentSar.min ||
    rent > RANGES.yearlyRentSar.max
  ) {
    errors.yearlyRentSar = FIELD_ERRORS.rentRange;
  }

  if (trimmed(values.description).length > LENGTHS.description.max) {
    errors.description = FIELD_ERRORS.descriptionLength;
  }

  if (!STATUSES.includes(values.status)) {
    errors.status = FIELD_ERRORS.statusRequired;
  }

  // Tenant and lease details belong to an occupied property only (FR-ADD-07).
  if (values.status === 'Occupied') {
    const tenantName = trimmed(values.tenantName);
    if (tenantName === '') {
      errors.tenantName = FIELD_ERRORS.tenantNameRequired;
    } else if (
      tenantName.length < LENGTHS.tenantName.min ||
      tenantName.length > LENGTHS.tenantName.max
    ) {
      errors.tenantName = FIELD_ERRORS.tenantNameLength;
    }

    const start = trimmed(values.leaseStart);
    const end = trimmed(values.leaseEnd);
    // Both dates are `YYYY-MM-DD`, so comparing the strings compares the dates.
    if (start !== '' && end !== '' && end <= start) {
      errors.leaseEnd = FIELD_ERRORS.leaseEndAfterStart;
    }
  }

  return errors;
}

/**
 * Check the two filter ranges that can be the wrong way round (FR-SRC-07, Appendix C.1).
 * @param {{ rentFrom?: unknown, rentTo?: unknown, sizeFrom?: unknown, sizeTo?: unknown }} filters
 * @returns {Record<string, string>} One message per invalid range. Empty when both are fine.
 */
export function validateFilters(filters = {}) {
  /** @type {Record<string, string>} */
  const errors = {};

  const rentFrom = toWholeNumber(filters.rentFrom);
  const rentTo = toWholeNumber(filters.rentTo);
  if (rentFrom !== null && rentTo !== null && rentFrom > rentTo) {
    errors.rent = FIELD_ERRORS.rentFilterOrder;
  }

  const sizeFrom = toWholeNumber(filters.sizeFrom);
  const sizeTo = toWholeNumber(filters.sizeTo);
  if (sizeFrom !== null && sizeTo !== null && sizeFrom > sizeTo) {
    errors.size = FIELD_ERRORS.sizeFilterOrder;
  }

  return errors;
}

/**
 * Turn the form's values into the shape stored in the portfolio: text trimmed, numbers as numbers,
 * all 13 amenity flags present, and tenancy fields cleared unless the status is Occupied
 * (FR-ADD-12, FR-UPD-07). Call it only on values that `validateProperty` accepted.
 * @param {Record<string, unknown>} values
 * @returns {Record<string, unknown>} A new object; the input is never changed (NFR-REL-04).
 */
export function normaliseValues(values = {}) {
  const amenities = { ...emptyAmenities() };
  for (const key of AMENITY_KEYS) {
    amenities[key] = Boolean(values.amenities?.[key]);
  }

  const normalised = {
    city: values.city,
    district: trimmed(values.district),
    front: FRONTS.includes(values.front) ? values.front : '',
    propertyType: values.propertyType,
    sizeSqm: toWholeNumber(values.sizeSqm),
    propertyAgeYears: toWholeNumber(values.propertyAgeYears),
    bedrooms: toWholeNumber(values.bedrooms),
    bathrooms: toWholeNumber(values.bathrooms),
    livingRooms: toWholeNumber(values.livingRooms),
    amenities,
    yearlyRentSar: toWholeNumber(values.yearlyRentSar),
    description: trimmed(values.description),
    status: values.status,
    tenantName: '',
    leaseStart: '',
    leaseEnd: '',
  };

  if (values.status === 'Occupied') {
    normalised.tenantName = trimmed(values.tenantName);
    normalised.leaseStart = trimmed(values.leaseStart);
    normalised.leaseEnd = trimmed(values.leaseEnd);
  }

  return normalised;
}
