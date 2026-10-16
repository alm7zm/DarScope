import { RENT_CHECK_FACTOR, RENT_ROUNDING_SAR } from '../constants/market.js';
import { DISTRICT_NAMES } from '../constants/options.js';
import { normalise } from './arabic.js';
import { validateProperty } from './validation.js';

/**
 * The rent model behind the form's rent suggestion (FR-ADD-13, SRS 7.6): Ridge regression on the log of the
 * yearly rent, trained by the team in `ai-model/prepare.ipynb` on the 2021 AQAR listings and
 * exported as plain numbers to `data/rent-model.json` (notebook step 19). These pure functions
 * turn a property's values into the model's inputs, and the inputs into a rent, the same way the
 * notebook does.
 */

/** The fields a suggestion needs. The district may be empty: an unknown one gets the average. */
export const SUGGESTION_FIELDS = [
  'city',
  'sizeSqm',
  'propertyAgeYears',
  'bedrooms',
  'bathrooms',
  'livingRooms',
];

/** The app's amenity keys, and the model's names for them: the dataset's column names. */
const MODEL_AMENITIES = {
  kitchen: 'kitchen',
  garage: 'garage',
  driverRoom: 'driver_room',
  maidRoom: 'maid_room',
  furnished: 'furnished',
  ac: 'ac',
  roof: 'roof',
  pool: 'pool',
  frontyard: 'frontyard',
  basement: 'basement',
  stairs: 'stairs',
  elevator: 'elevator',
  fireplace: 'fireplace',
};

/** An annex, but not ملحق به ("attached to it"), as in step 4d of the notebook. */
const ANNEX = /ملحق(?! به)/;
const INTERNAL_STAIRS = /درج داخلي/;
const CORNER_FRONTS = ['Three streets', 'Four streets'];

/** A district as the model keys it: its city, then its name after Appendix B.4, step 8 included. */
function districtKey(city, district) {
  return `${city}|${normalise(district, { stripDistrictWord: true })}`;
}

/**
 * The dropdown saves a district's English name, but the model learned its Arabic one, so each
 * listed English name leads to the Arabic name's key (FR-ADD-14). Case and spacing do not matter.
 */
const ARABIC_KEYS = new Map(
  Object.entries(DISTRICT_NAMES).flatMap(([city, names]) =>
    Object.entries(names).map(([english, arabic]) => [
      districtKey(city, english),
      districtKey(city, arabic),
    ]),
  ),
);

/** True when every field the model needs passes its check in Appendix C. */
export function canSuggestRent(values) {
  const errors = validateProperty(values);
  return SUGGESTION_FIELDS.every((field) => !(field in errors));
}

/**
 * The model's inputs for one property, computed as in steps 5 and 17 of the notebook. Text goes
 * through `normalise` (Appendix B.4), so Arabic spelling variants find the same district and words,
 * and a listed district's English name finds its Arabic one.
 *
 * @param {Record<string, any>} values A property's values, as the form holds them.
 */
export function modelInputs(values) {
  const size = Number(values.sizeSqm);
  const age = Number(values.propertyAgeYears);
  const bedrooms = Number(values.bedrooms);
  const bathrooms = Number(values.bathrooms);
  const livingRooms = Number(values.livingRooms);
  const amenities = values.amenities ?? {};
  const text = normalise(values.description);
  const district = districtKey(values.city, values.district);

  const numbers = {
    log_size: Math.log10(size),
    size_per_bedroom: size / Math.max(bedrooms, 1),
    property_age: age,
    is_new: age === 0 ? 1 : 0,
    bedrooms,
    bathrooms,
    livingrooms: livingRooms,
    total_rooms: bedrooms + bathrooms + livingRooms,
    amenity_count: Object.keys(MODEL_AMENITIES).filter((key) => amenities[key])
      .length,
    is_corner: CORNER_FRONTS.includes(values.front) ? 1 : 0,
    has_annex: ANNEX.test(text) ? 1 : 0,
    has_internal_stairs: INTERNAL_STAIRS.test(text) ? 1 : 0,
  };
  for (const [key, column] of Object.entries(MODEL_AMENITIES)) {
    numbers[column] = amenities[key] ? 1 : 0;
  }

  return {
    city: values.city,
    front: values.front,
    type: values.propertyType,
    district: ARABIC_KEYS.get(district) ?? district,
    numbers,
  };
}

/** A table's number for a key, or the fallback. Own keys only: "constructor" is no district. */
function lookUp(table, key, fallback = 0) {
  return Object.hasOwn(table, key) ? table[key] : fallback;
}

/**
 * The model's yearly rent for a property, before rounding. The log of the rent is the base plus
 * one number each for the city, front, type and district, plus each input times its weight.
 *
 * @param {Record<string, any>} model The contents of `data/rent-model.json`.
 * @param {Record<string, any>} values A property's values, as the form holds them.
 * @returns {{ rent: number, knownDistrict: boolean } | null} null for a size outside the sizes
 *   the model learned from, where a weighted sum gives absurd rents.
 */
export function predictRent(model, values) {
  const size = Number(values.sizeSqm);
  if (size < model.sizeRange.min || size > model.sizeRange.max) return null;

  const inputs = modelInputs(values);
  const knownDistrict = Object.hasOwn(model.district, inputs.district);
  let logRent =
    model.base +
    lookUp(model.city, inputs.city) +
    lookUp(model.front, inputs.front) +
    lookUp(model.type, inputs.type) +
    lookUp(model.district, inputs.district, model.districtUnknown);
  for (const [column, weight] of Object.entries(model.numbers)) {
    logRent += weight * inputs.numbers[column];
  }
  return { rent: Math.exp(logRent), knownDistrict };
}

/** A value rounded to the nearest step: 123,468 to the nearest 500 is 123,500. */
export function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

/**
 * The suggestion the form shows (FR-ADD-13): the model's rent rounded to the nearest 500 SAR.
 *
 * @returns {{ rent: number, knownDistrict: boolean } | null} null as for `predictRent`.
 */
export function suggestedRent(model, values) {
  const guess = predictRent(model, values);
  if (!guess) return null;
  return {
    rent: roundToNearest(guess.rent, RENT_ROUNDING_SAR),
    knownDistrict: guess.knownDistrict,
  };
}

/**
 * True when a rent is more than RENT_CHECK_FACTOR times the suggestion, or less than its share,
 * which is most likely a typing mistake such as an extra or a missing zero (FR-RNT-07).
 */
export function isFarFromSuggestion(rent, suggestion) {
  return (
    rent > suggestion * RENT_CHECK_FACTOR ||
    rent < suggestion / RENT_CHECK_FACTOR
  );
}
