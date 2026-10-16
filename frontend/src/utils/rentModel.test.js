import { describe, expect, it } from 'vitest';
import { DISTRICTS } from '../constants/options.js';
import realModel from '../data/rent-model.json';
import {
  canSuggestRent,
  isFarFromSuggestion,
  modelInputs,
  predictRent,
  roundToNearest,
  suggestedRent,
} from './rentModel.js';

/** A tiny model with round numbers, so each part of the sum can be checked by hand. */
const TINY_MODEL = {
  sizeRange: { min: 100, max: 1000 },
  base: 1,
  city: { Riyadh: 0.5 },
  front: { North: 0.25 },
  type: { Villa: 0.125 },
  district: { 'Riyadh|الروضه': 2 },
  districtUnknown: 1.5,
  numbers: { log_size: 1 },
};

/** A house that every number of TINY_MODEL applies to. */
const HOUSE = {
  city: 'Riyadh',
  district: 'حي الروضة', // Al Rawdah district, spelled with ة and the word حي
  front: 'North',
  propertyType: 'Villa',
  sizeSqm: '100',
  propertyAgeYears: '0',
  bedrooms: '5',
  bathrooms: '4',
  livingRooms: '2',
  amenities: {},
  description: '',
};

describe('predictRent (FR-ADD-13)', () => {
  it('adds the base, the city, front, type and district numbers, and each input times its weight', () => {
    // log rent = 1 + 0.5 + 0.25 + 0.125 + 2 + 1 × log10(100) = 5.875
    const { rent, knownDistrict } = predictRent(TINY_MODEL, HOUSE);
    expect(rent).toBeCloseTo(Math.exp(5.875), 6);
    expect(knownDistrict).toBe(true);
  });

  it('finds the district after Arabic normalisation, without the word حي (Appendix B.4)', () => {
    expect(
      predictRent(TINY_MODEL, { ...HOUSE, district: 'الروضه' }).knownDistrict,
    ).toBe(true);
  });

  it('finds a district by the English name the dropdown saves, in any case (FR-ADD-14)', () => {
    for (const district of ['Al Rawdah', ' al  RAWDAH ']) {
      expect(modelInputs({ ...HOUSE, district }).district).toBe(
        'Riyadh|الروضه',
      );
    }
    // Jeddah has an Al Rawdah too, and it is Jeddah's own district.
    expect(
      modelInputs({ ...HOUSE, city: 'Jeddah', district: 'Al Rawdah' }).district,
    ).toBe('Jeddah|الروضه');
  });

  it('gives a district it does not know the average district instead', () => {
    // 1 + 0.5 + 0.25 + 0.125 + 1.5 + 2 = 5.375
    const { rent, knownDistrict } = predictRent(TINY_MODEL, {
      ...HOUSE,
      district: 'Al Ghadir', // a Riyadh district the 2021 data does not have
    });
    expect(rent).toBeCloseTo(Math.exp(5.375), 6);
    expect(knownDistrict).toBe(false);
  });

  it('keeps the same district name in another city apart', () => {
    // No number for Jeddah, and no Jeddah|الروضه: 1 + 0 + 0.25 + 0.125 + 1.5 + 2 = 4.875
    const { rent, knownDistrict } = predictRent(TINY_MODEL, {
      ...HOUSE,
      city: 'Jeddah',
    });
    expect(rent).toBeCloseTo(Math.exp(4.875), 6);
    expect(knownDistrict).toBe(false);
  });

  it('adds nothing for an empty front, or for a value that is no key of its table', () => {
    // 1 + 0.5 + 0 + 0.125 + 2 + 2 = 5.625
    for (const front of ['', 'constructor']) {
      expect(predictRent(TINY_MODEL, { ...HOUSE, front }).rent).toBeCloseTo(
        Math.exp(5.625),
        6,
      );
    }
  });

  it('suggests nothing outside the sizes the model learned from', () => {
    expect(predictRent(TINY_MODEL, { ...HOUSE, sizeSqm: '99' })).toBeNull();
    expect(predictRent(TINY_MODEL, { ...HOUSE, sizeSqm: '1001' })).toBeNull();
    expect(
      predictRent(TINY_MODEL, { ...HOUSE, sizeSqm: '100' }),
    ).not.toBeNull();
    expect(
      predictRent(TINY_MODEL, { ...HOUSE, sizeSqm: '1000' }),
    ).not.toBeNull();
  });
});

describe('modelInputs: the inputs the notebook computes in steps 5 and 17', () => {
  it('marks a new house, and divides the size by the bedrooms, treating 0 as 1', () => {
    const { numbers } = modelInputs({
      ...HOUSE,
      sizeSqm: '400',
      bedrooms: '0',
    });
    expect(numbers.log_size).toBeCloseTo(Math.log10(400), 12);
    expect(numbers.size_per_bedroom).toBe(400);
    expect(numbers.is_new).toBe(1);
    expect(
      modelInputs({ ...HOUSE, propertyAgeYears: '3' }).numbers.is_new,
    ).toBe(0);
  });

  it('adds up the rooms and the amenities, under the dataset’s column names', () => {
    const { numbers } = modelInputs({
      ...HOUSE,
      amenities: { driverRoom: true, maidRoom: true, pool: false },
    });
    expect(numbers.total_rooms).toBe(11);
    expect(numbers.amenity_count).toBe(2);
    expect(numbers.driver_room).toBe(1);
    expect(numbers.maid_room).toBe(1);
    expect(numbers.pool).toBe(0);
  });

  it('counts a corner only for three or four streets', () => {
    const corner = (front) =>
      modelInputs({ ...HOUSE, front }).numbers.is_corner;
    expect(corner('Three streets')).toBe(1);
    expect(corner('Four streets')).toBe(1);
    expect(corner('North')).toBe(0);
  });

  it('finds an annex in the description, but not ملحق بها ("attached to it")', () => {
    const annex = (description) =>
      modelInputs({ ...HOUSE, description }).numbers.has_annex;
    expect(annex('فيلا مع ملحق')).toBe(1); // a villa with an annex
    expect(annex('فيلا مع مُلحق')).toBe(1); // the same, with a vowel mark
    expect(annex('غرفه ماستر ملحق بها حمام')).toBe(0); // a bedroom with its own bathroom
    expect(annex('')).toBe(0);
  });

  it('finds an internal staircase, however many spaces are between the words', () => {
    const stairs = (description) =>
      modelInputs({ ...HOUSE, description }).numbers.has_internal_stairs;
    expect(stairs('درج   داخلي')).toBe(1);
    expect(stairs('درج خارجي')).toBe(0); // an outside staircase
  });

  it('gives the exported model every input it has a weight for', () => {
    const { numbers } = modelInputs(HOUSE);
    for (const column of Object.keys(realModel.numbers)) {
      expect(Number.isFinite(numbers[column]), column).toBe(true);
    }
  });
});

describe('the exported model (ai-model/prepare.ipynb, step 19)', () => {
  // Two made-up houses, not from the data. Step 19 of the notebook prints scikit-learn's rents
  // for them: 123,468.08 and 49,742.77 SAR. If the model is exported again, copy the new rents.
  const RIYADH_VILLA = {
    city: 'Riyadh',
    district: 'حي الملقا',
    front: 'North',
    propertyType: 'Villa',
    sizeSqm: '400',
    propertyAgeYears: '0',
    bedrooms: '5',
    bathrooms: '5',
    livingRooms: '2',
    amenities: { kitchen: true, garage: true, maidRoom: true, ac: true },
    description: 'فيلا جديدة مع ملحق', // a new villa with an annex
  };
  const JEDDAH_DUPLEX = {
    city: 'Jeddah',
    district: 'Unknown district',
    front: '',
    propertyType: 'Duplex',
    sizeSqm: '300',
    propertyAgeYears: '10',
    bedrooms: '4',
    bathrooms: '3',
    livingRooms: '1',
    amenities: {},
    description: '',
  };

  it('gives the same rents as scikit-learn, to within 0.005%', () => {
    const villa = predictRent(realModel, RIYADH_VILLA);
    const duplex = predictRent(realModel, JEDDAH_DUPLEX);
    expect(villa.rent / 123468.08 - 1).toBeCloseTo(0, 4);
    expect(duplex.rent / 49742.77 - 1).toBeCloseTo(0, 4);
    expect(villa.knownDistrict).toBe(true);
    expect(duplex.knownDistrict).toBe(false);
  });

  it('knows every district the District dropdown offers, by its English name (FR-ADD-14)', () => {
    expect(
      predictRent(realModel, { ...RIYADH_VILLA, district: 'Al Malqa' }).rent,
    ).toBe(predictRent(realModel, RIYADH_VILLA).rent);

    for (const [city, names] of Object.entries(DISTRICTS)) {
      for (const district of names) {
        const guess = predictRent(realModel, {
          ...RIYADH_VILLA,
          city,
          district,
        });
        expect(guess.knownDistrict, `${district}, ${city}`).toBe(true);
      }
    }
  });
});

describe('roundToNearest', () => {
  it('rounds to the nearest 500 SAR, as the estimate does (FR-EST-01)', () => {
    expect(roundToNearest(123468, 500)).toBe(123500);
    expect(roundToNearest(123249, 500)).toBe(123000);
    expect(roundToNearest(123250, 500)).toBe(123500);
  });
});

describe('suggestedRent', () => {
  it('is the model’s rent to the nearest 500 SAR, or nothing outside the model’s sizes', () => {
    // e^5.875 is about 356.3 SAR, which is nearer 500 than 0.
    expect(suggestedRent(TINY_MODEL, HOUSE)).toEqual({
      rent: 500,
      knownDistrict: true,
    });
    expect(suggestedRent(TINY_MODEL, { ...HOUSE, sizeSqm: '5000' })).toBeNull();
  });
});

describe('isFarFromSuggestion (FR-RNT-07)', () => {
  it('flags a rent more than 3 times the suggestion, or under a third of it', () => {
    expect(isFarFromSuggestion(300000, 100000)).toBe(false);
    expect(isFarFromSuggestion(300001, 100000)).toBe(true);
    expect(isFarFromSuggestion(34000, 100000)).toBe(false);
    expect(isFarFromSuggestion(33000, 100000)).toBe(true);
  });

  it('catches an extra or a missing zero', () => {
    expect(isFarFromSuggestion(1200000, 120000)).toBe(true);
    expect(isFarFromSuggestion(12000, 120000)).toBe(true);
  });
});

describe('canSuggestRent', () => {
  it('needs a valid city, size, age and room counts (Appendix C)', () => {
    expect(canSuggestRent(HOUSE)).toBe(true);
    expect(canSuggestRent({ ...HOUSE, city: '' })).toBe(false);
    expect(canSuggestRent({ ...HOUSE, sizeSqm: '' })).toBe(false);
    expect(canSuggestRent({ ...HOUSE, sizeSqm: '12.5' })).toBe(false);
    expect(canSuggestRent({ ...HOUSE, livingRooms: '' })).toBe(false);
  });

  it('does not need the district, the rent or the status', () => {
    expect(
      canSuggestRent({ ...HOUSE, district: '', yearlyRentSar: '', status: '' }),
    ).toBe(true);
  });
});
