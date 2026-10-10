/**
 * The only code that reads or writes properties (FR-DAT-03), and the only module Part 2 replaces.
 * Part 1 keeps the portfolio in a module-level variable, seeded from `portfolio.seed.json`
 * (FR-DAT-02). Every operation returns a Promise, so the pages already treat a write the way they
 * will treat an HTTP call.
 */
import seed from '../data/portfolio.seed.json';
import { TEXT } from '../constants/messages.js';
import { normaliseValues, validateProperty } from '../utils/validation.js';

/** The live portfolio. Replaced, never mutated in place (NFR-REL-04). */
let portfolio = [];

/**
 * The highest ID number issued this session. It only ever goes up, so the ID of a deleted
 * property is never given to a new one (FR-DEL-06, FR-DAT-04). Never derive the next ID from the
 * collection's length: deleting RP-0003 would then make the next new property RP-0003 again.
 */
let highestIdIssued = 0;

/** Thrown when a check in SRS Appendix C fails. `errors` holds one message per invalid field. */
export class ValidationError extends Error {
  /** @param {Record<string, string>} errors */
  constructor(errors) {
    super('The property has invalid fields.');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/** Thrown when no property has the given ID (FR-DET-03). */
export class NotFoundError extends Error {
  /** @param {string} id */
  constructor(id) {
    super(TEXT.propertyNotFound);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

/** Read the number out of an ID such as `RP-0007`. Returns 0 for anything else. */
function idNumber(id) {
  const match = /^RP-(\d+)$/.exec(String(id ?? ''));
  return match ? Number(match[1]) : 0;
}

/** `RP-` plus four digits, one higher than any ID issued so far (FR-ADD-04). */
function nextId() {
  highestIdIssued += 1;
  return `RP-${String(highestIdIssued).padStart(4, '0')}`;
}

/** A deep copy, so a caller can never reach into the stored collection. */
function copy(value) {
  return structuredClone(value);
}

/** Load the seed into memory and set the ID counter above every seeded ID (FR-DAT-01). */
function loadSeed() {
  portfolio = copy(seed);
  highestIdIssued = portfolio.reduce(
    (highest, property) => Math.max(highest, idNumber(property.id)),
    0,
  );
}

loadSeed();

/** Find a property's position, or -1. */
function indexOf(id) {
  return portfolio.findIndex((property) => property.id === id);
}

/**
 * Every property in the portfolio.
 * @returns {Promise<Array<Record<string, unknown>>>} Never fails.
 */
export function list() {
  return Promise.resolve(copy(portfolio));
}

/**
 * One property by ID.
 * @param {string} id
 * @returns {Promise<Record<string, unknown>>} Rejects with NotFoundError when no property has it.
 */
export function getById(id) {
  const index = indexOf(id);
  if (index === -1) return Promise.reject(new NotFoundError(id));
  return Promise.resolve(copy(portfolio[index]));
}

/**
 * Add a property. The app sets the ID and both timestamps (FR-ADD-04).
 * @param {Record<string, unknown>} values Field values, without `id` or timestamps.
 * @returns {Promise<Record<string, unknown>>} Rejects with ValidationError when a check fails.
 */
export function create(values) {
  const errors = validateProperty(values);
  if (Object.keys(errors).length > 0) {
    return Promise.reject(new ValidationError(errors));
  }

  const now = new Date().toISOString();
  const property = {
    id: nextId(),
    ...normaliseValues(values),
    createdAt: now,
    updatedAt: now,
  };

  portfolio = [...portfolio, property];
  return Promise.resolve(copy(property));
}

/**
 * Change a property. `id` and `createdAt` never change; `updatedAt` is set on every save
 * (FR-UPD-03).
 * @param {string} id
 * @param {Record<string, unknown>} values
 * @returns {Promise<Record<string, unknown>>} Rejects when the ID is unknown or a check fails.
 */
export function update(id, values) {
  const index = indexOf(id);
  if (index === -1) return Promise.reject(new NotFoundError(id));

  const errors = validateProperty(values);
  if (Object.keys(errors).length > 0) {
    return Promise.reject(new ValidationError(errors));
  }

  const existing = portfolio[index];
  const property = {
    ...normaliseValues(values),
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  portfolio = portfolio.with(index, property);
  return Promise.resolve(copy(property));
}

/**
 * Remove a property and return it, so that Undo can put it back (FR-DEL-03, FR-DEL-07).
 * @param {string} id
 * @returns {Promise<Record<string, unknown>>} Rejects with NotFoundError when the ID is unknown.
 */
export function remove(id) {
  const index = indexOf(id);
  if (index === -1) return Promise.reject(new NotFoundError(id));

  const removed = portfolio[index];
  portfolio = portfolio.filter((property) => property.id !== id);
  return Promise.resolve(copy(removed));
}

/**
 * Put back a property that `remove` returned, with the same ID and values (FR-DEL-07).
 * @param {Record<string, unknown>} property
 * @returns {Promise<Record<string, unknown>>} Rejects when a property with that ID already exists.
 */
export function restore(property) {
  if (!property || indexOf(property.id) !== -1) {
    return Promise.reject(
      new Error(`A property with the ID ${property?.id} already exists.`),
    );
  }

  // Put it back where its ID belongs, so the list does not jump the row to the end.
  const restored = copy(property);
  const position = portfolio.findIndex(
    (existing) => idNumber(existing.id) > idNumber(restored.id),
  );
  portfolio =
    position === -1
      ? [...portfolio, restored]
      : portfolio.toSpliced(position, 0, restored);

  return Promise.resolve(copy(restored));
}

/**
 * Restore the seed (FR-DAT-05). The ID counter is left alone, so an ID issued this session is
 * still never reissued.
 * @returns {Promise<Array<Record<string, unknown>>>} Never fails.
 */
export function reset() {
  const seeded = copy(seed);
  portfolio = seeded;
  highestIdIssued = Math.max(
    highestIdIssued,
    seeded.reduce(
      (highest, property) => Math.max(highest, idNumber(property.id)),
      0,
    ),
  );
  return Promise.resolve(copy(portfolio));
}

/**
 * Put the service back to its starting state. For tests only, so that each one begins from a fresh
 * copy of the seed with the ID counter where it started (testing rules).
 */
export function __resetForTests() {
  loadSeed();
}
