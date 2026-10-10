import { describe, expect, it } from 'vitest';
import { FIELD_ERRORS } from '../constants/messages.js';
import { validValues } from '../test/fixtures.js';
import {
  normaliseValues,
  toWholeNumber,
  validateFilters,
  validateProperty,
} from './validation.js';

describe('toWholeNumber (FR-ADD-12)', () => {
  it('accepts a whole number and digits-only text', () => {
    expect(toWholeNumber(450)).toBe(450);
    expect(toWholeNumber('450')).toBe(450);
    expect(toWholeNumber('  450  ')).toBe(450);
    expect(toWholeNumber(0)).toBe(0);
  });

  it.each([4.5, '4.5', '', '   ', 'abc', '4a', '-5', null, undefined, NaN, {}])(
    'rejects %j',
    (value) => {
      expect(toWholeNumber(value)).toBeNull();
    },
  );
});

describe('validateProperty: a valid property', () => {
  it('reports no error', () => {
    expect(validateProperty(validValues())).toEqual({});
  });

  it('accepts values that arrive from the form as text', () => {
    const asText = validValues({
      sizeSqm: '450',
      propertyAgeYears: '5',
      bedrooms: '4',
      bathrooms: '3',
      livingRooms: '2',
      yearlyRentSar: '120000',
    });
    expect(validateProperty(asText)).toEqual({});
  });
});

describe('validateProperty: city, district and type (Appendix C.1)', () => {
  it.each([undefined, '', 'Mecca'])('rejects the city %j', (city) => {
    expect(validateProperty(validValues({ city })).city).toBe(
      FIELD_ERRORS.cityRequired,
    );
  });

  it.each(['', '   ', undefined])(
    'asks for the district when it is %j',
    (district) => {
      expect(validateProperty(validValues({ district })).district).toBe(
        FIELD_ERRORS.districtRequired,
      );
    },
  );

  it('holds the district to 2 to 60 characters', () => {
    expect(validateProperty(validValues({ district: 'A' })).district).toBe(
      FIELD_ERRORS.districtLength,
    );
    expect(
      validateProperty(validValues({ district: 'A'.repeat(61) })).district,
    ).toBe(FIELD_ERRORS.districtLength);
    // Both boundaries pass.
    expect(
      validateProperty(validValues({ district: 'AB' })).district,
    ).toBeUndefined();
    expect(
      validateProperty(validValues({ district: 'A'.repeat(60) })).district,
    ).toBeUndefined();
  });

  it('trims the district before measuring it', () => {
    expect(
      validateProperty(validValues({ district: '  AB  ' })).district,
    ).toBeUndefined();
  });

  it.each([undefined, '', 'Apartment'])(
    'rejects the type %j',
    (propertyType) => {
      expect(validateProperty(validValues({ propertyType })).propertyType).toBe(
        FIELD_ERRORS.propertyTypeRequired,
      );
    },
  );
});

describe('validateProperty: size and rent have a separate whole-number message', () => {
  it.each(['', 'abc', '45.5', undefined])(
    'asks for a whole size when it is %j',
    (sizeSqm) => {
      expect(validateProperty(validValues({ sizeSqm })).sizeSqm).toBe(
        FIELD_ERRORS.sizeWholeNumber,
      );
    },
  );

  it('holds the size to 20 to 100,000 m2', () => {
    expect(validateProperty(validValues({ sizeSqm: 19 })).sizeSqm).toBe(
      FIELD_ERRORS.sizeRange,
    );
    expect(validateProperty(validValues({ sizeSqm: 100001 })).sizeSqm).toBe(
      FIELD_ERRORS.sizeRange,
    );
    expect(
      validateProperty(validValues({ sizeSqm: 20 })).sizeSqm,
    ).toBeUndefined();
    expect(
      validateProperty(validValues({ sizeSqm: 100000 })).sizeSqm,
    ).toBeUndefined();
  });

  it.each(['', 'abc', '1000.5', undefined])(
    'asks for a whole rent when it is %j',
    (rent) => {
      expect(
        validateProperty(validValues({ yearlyRentSar: rent })).yearlyRentSar,
      ).toBe(FIELD_ERRORS.rentWholeNumber);
    },
  );

  it('holds the rent to 1,000 to 10,000,000 SAR', () => {
    expect(
      validateProperty(validValues({ yearlyRentSar: 999 })).yearlyRentSar,
    ).toBe(FIELD_ERRORS.rentRange);
    expect(
      validateProperty(validValues({ yearlyRentSar: 10000001 })).yearlyRentSar,
    ).toBe(FIELD_ERRORS.rentRange);
    expect(
      validateProperty(validValues({ yearlyRentSar: 1000 })).yearlyRentSar,
    ).toBeUndefined();
    expect(
      validateProperty(validValues({ yearlyRentSar: 10000000 })).yearlyRentSar,
    ).toBeUndefined();
  });
});

describe('validateProperty: the counts share one message for text and for range', () => {
  const cases = [
    ['propertyAgeYears', 0, 100, FIELD_ERRORS.propertyAgeRange],
    ['bedrooms', 0, 20, FIELD_ERRORS.bedroomsRange],
    ['bathrooms', 0, 20, FIELD_ERRORS.bathroomsRange],
    ['livingRooms', 0, 20, FIELD_ERRORS.livingRoomsRange],
  ];

  it.each(cases)('accepts both boundaries of %s', (field, min, max) => {
    expect(
      validateProperty(validValues({ [field]: min }))[field],
    ).toBeUndefined();
    expect(
      validateProperty(validValues({ [field]: max }))[field],
    ).toBeUndefined();
  });

  it.each(cases)('rejects either side of %s', (field, min, max, message) => {
    expect(validateProperty(validValues({ [field]: min - 1 }))[field]).toBe(
      message,
    );
    expect(validateProperty(validValues({ [field]: max + 1 }))[field]).toBe(
      message,
    );
  });

  it.each(cases)(
    'rejects text and a missing value for %s',
    (field, _min, _max, message) => {
      expect(validateProperty(validValues({ [field]: 'abc' }))[field]).toBe(
        message,
      );
      expect(validateProperty(validValues({ [field]: '' }))[field]).toBe(
        message,
      );
      expect(validateProperty(validValues({ [field]: undefined }))[field]).toBe(
        message,
      );
    },
  );
});

describe('validateProperty: description and status', () => {
  it('allows exactly 2,000 characters and rejects 2,001', () => {
    expect(
      validateProperty(validValues({ description: 'x'.repeat(2000) }))
        .description,
    ).toBeUndefined();
    expect(
      validateProperty(validValues({ description: 'x'.repeat(2001) }))
        .description,
    ).toBe(FIELD_ERRORS.descriptionLength);
  });

  it('allows an empty description, which is optional', () => {
    expect(
      validateProperty(validValues({ description: '' })).description,
    ).toBeUndefined();
  });

  it.each([undefined, '', 'Sold'])('rejects the status %j', (status) => {
    expect(validateProperty(validValues({ status })).status).toBe(
      FIELD_ERRORS.statusRequired,
    );
  });
});

describe('validateProperty: tenancy (FR-ADD-07)', () => {
  it('requires a tenant name when the property is Occupied', () => {
    const errors = validateProperty(
      validValues({ status: 'Occupied', tenantName: '' }),
    );
    expect(errors.tenantName).toBe(FIELD_ERRORS.tenantNameRequired);
  });

  it('holds the tenant name to 2 to 80 characters', () => {
    const short = validValues({ status: 'Occupied', tenantName: 'A' });
    const long = validValues({
      status: 'Occupied',
      tenantName: 'A'.repeat(81),
    });
    expect(validateProperty(short).tenantName).toBe(
      FIELD_ERRORS.tenantNameLength,
    );
    expect(validateProperty(long).tenantName).toBe(
      FIELD_ERRORS.tenantNameLength,
    );
    expect(
      validateProperty(validValues({ status: 'Occupied', tenantName: 'AB' }))
        .tenantName,
    ).toBeUndefined();
  });

  it.each(['Vacant', 'Under maintenance'])(
    'does not ask for a tenant name when the status is %s',
    (status) => {
      expect(
        validateProperty(validValues({ status, tenantName: '' })).tenantName,
      ).toBeUndefined();
    },
  );

  it('requires lease end to be after lease start', () => {
    const occupied = (leaseStart, leaseEnd) =>
      validateProperty(
        validValues({
          status: 'Occupied',
          tenantName: 'Nora Al Harbi',
          leaseStart,
          leaseEnd,
        }),
      );

    expect(occupied('2026-06-01', '2026-01-01').leaseEnd).toBe(
      FIELD_ERRORS.leaseEndAfterStart,
    );
    // The same day is not after the start.
    expect(occupied('2026-06-01', '2026-06-01').leaseEnd).toBe(
      FIELD_ERRORS.leaseEndAfterStart,
    );
    expect(occupied('2026-01-01', '2026-12-31').leaseEnd).toBeUndefined();
  });

  it('does not compare lease dates when only one is given', () => {
    const errors = validateProperty(
      validValues({
        status: 'Occupied',
        tenantName: 'Nora Al Harbi',
        leaseStart: '2026-01-01',
      }),
    );
    expect(errors.leaseEnd).toBeUndefined();
  });
});

describe('validateProperty: every failing field is reported at once (FR-ADD-03)', () => {
  it('collects one message per invalid field', () => {
    const errors = validateProperty({
      city: '',
      district: '',
      propertyType: '',
      sizeSqm: '',
      propertyAgeYears: '',
      bedrooms: '',
      bathrooms: '',
      livingRooms: '',
      yearlyRentSar: '',
      status: '',
    });
    expect(Object.keys(errors).sort()).toEqual([
      'bathrooms',
      'bedrooms',
      'city',
      'district',
      'livingRooms',
      'propertyAgeYears',
      'propertyType',
      'sizeSqm',
      'status',
      'yearlyRentSar',
    ]);
  });
});

describe('validateFilters (FR-SRC-07)', () => {
  it('rejects a rent range that is the wrong way round', () => {
    expect(validateFilters({ rentFrom: 200000, rentTo: 100000 }).rent).toBe(
      FIELD_ERRORS.rentFilterOrder,
    );
  });

  it('rejects a size range that is the wrong way round', () => {
    expect(validateFilters({ sizeFrom: 600, sizeTo: 300 }).size).toBe(
      FIELD_ERRORS.sizeFilterOrder,
    );
  });

  it('accepts equal ends and a correct order', () => {
    expect(validateFilters({ rentFrom: 100000, rentTo: 100000 })).toEqual({});
    expect(validateFilters({ sizeFrom: 300, sizeTo: 600 })).toEqual({});
  });

  it('ignores a range with only one end set', () => {
    expect(validateFilters({ rentFrom: 200000 })).toEqual({});
    expect(validateFilters({ sizeTo: 300 })).toEqual({});
    expect(validateFilters({})).toEqual({});
  });
});

describe('normaliseValues', () => {
  it('trims text and turns number text into numbers', () => {
    const result = normaliseValues(
      validValues({
        district: '  Al Malqa  ',
        sizeSqm: '450',
        description: '  Nice  ',
      }),
    );
    expect(result.district).toBe('Al Malqa');
    expect(result.sizeSqm).toBe(450);
    expect(result.description).toBe('Nice');
  });

  it('fills in all 13 amenity flags, defaulting each to no (SRS 3.2)', () => {
    const result = normaliseValues(validValues({ amenities: { pool: true } }));
    expect(Object.keys(result.amenities)).toHaveLength(13);
    expect(result.amenities.pool).toBe(true);
    expect(result.amenities.kitchen).toBe(false);
  });

  it.each(['Vacant', 'Under maintenance'])(
    'clears tenant and lease details when the status is %s (FR-UPD-07)',
    (status) => {
      const result = normaliseValues(
        validValues({
          status,
          tenantName: 'Nora Al Harbi',
          leaseStart: '2026-01-01',
          leaseEnd: '2026-12-31',
        }),
      );
      expect(result.tenantName).toBe('');
      expect(result.leaseStart).toBe('');
      expect(result.leaseEnd).toBe('');
    },
  );

  it('keeps tenant and lease details when the status is Occupied', () => {
    const result = normaliseValues(
      validValues({
        status: 'Occupied',
        tenantName: '  Nora Al Harbi  ',
        leaseStart: '2026-01-01',
        leaseEnd: '2026-12-31',
      }),
    );
    expect(result.tenantName).toBe('Nora Al Harbi');
    expect(result.leaseStart).toBe('2026-01-01');
  });

  it('drops a front that is not one of the choices, since it is optional', () => {
    expect(normaliseValues(validValues({ front: 'Sideways' })).front).toBe('');
    expect(normaliseValues(validValues({ front: 'North' })).front).toBe(
      'North',
    );
  });

  it('never changes the values it was given (NFR-REL-04)', () => {
    const input = validValues({ district: '  Al Malqa  ' });
    const copy = structuredClone(input);
    normaliseValues(input);
    expect(input).toEqual(copy);
  });
});
