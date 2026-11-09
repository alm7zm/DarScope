/**
 * An in-memory stand-in for `services/propertyService.js`, so tests run with no Spring server.
 * `test/setup.js` puts it in place of the real service for every test except the service's own,
 * which tests the HTTP calls with a stubbed `fetch`.
 *
 * It behaves like the real backend: it checks every field, issues `RP-` IDs that are never reused,
 * sets both timestamps, and serves pages newest first. It starts from `portfolio.seed.json`.
 */
import { vi } from 'vitest';
import { DEFAULT_SORT, paginate, sortProperties } from '../utils/sort.js';
import { normaliseValues, validateProperty } from '../utils/validation.js';
import seed from './portfolio.seed.json';

// The real error classes, so a test sees exactly what the app would see.
const { ValidationError, NotFoundError } = await vi.importActual(
  '../services/propertyService.js',
);
export { ValidationError, NotFoundError };

/** The live portfolio. Replaced, never mutated in place (NFR-REL-04). */
let portfolio = [];

/** The highest ID number issued, so a deleted property's ID is never given out again (FR-DEL-06). */
let highestIdIssued = 0;

function idNumber(id) {
  const match = /^RP-(\d+)$/.exec(String(id ?? ''));
  return match ? Number(match[1]) : 0;
}

function nextId() {
  highestIdIssued += 1;
  return `RP-${String(highestIdIssued).padStart(4, '0')}`;
}

/** A deep copy, so a test can never reach into the stored collection. */
function copy(value) {
  return structuredClone(value);
}

function indexOf(id) {
  return portfolio.findIndex((property) => property.id === id);
}

/** Back to the seed, with the ID counter where it started. `setup.js` calls it before each test. */
export function __resetForTests() {
  portfolio = copy(seed);
  highestIdIssued = portfolio.reduce(
    (highest, property) => Math.max(highest, idNumber(property.id)),
    0,
  );
}

__resetForTests();

export function list() {
  return Promise.resolve(copy(portfolio));
}

/** One page, newest first, in the same shape as the real `listPage`. */
export function listPage(page = 1, perPage = 10) {
  const sorted = sortProperties(portfolio, DEFAULT_SORT);
  return Promise.resolve({
    ...copy(paginate(sorted, { page, perPage })),
    total: portfolio.length,
  });
}

export function getById(id) {
  const index = indexOf(id);
  if (index === -1) return Promise.reject(new NotFoundError(id));
  return Promise.resolve(copy(portfolio[index]));
}

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

export function remove(id) {
  const index = indexOf(id);
  if (index === -1) return Promise.reject(new NotFoundError(id));
  portfolio = portfolio.filter((property) => property.id !== id);
  return Promise.resolve({ id });
}
