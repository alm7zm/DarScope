/**
 * The only code that reads or writes properties (FR-DAT-03). Since Part 2 it calls the team's
 * Spring server, whose routes are in `docs/backend-plan.md`. During development Vite forwards
 * `/api` to the server on port 8080 (`vite.config.js`).
 *
 * The server keeps the shape of lab 14: a numeric ID, the 13 amenities as flat fields, and null
 * for an empty field. The app keeps its own shape: `RP-0007`, an `amenities` object, and empty
 * text. `fromServer` and `toServer` translate between the two, so no page sees the difference.
 */
import { TEXT } from '../constants/messages.js';
import { AMENITY_KEYS } from '../constants/options.js';
import { normaliseValues, validateProperty } from '../utils/validation.js';

const BASE_URL = '/api/v1/properties';

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

/** The server's number for an ID such as `RP-0007`. Returns 0 for anything else. */
export function idNumber(id) {
  const match = /^RP-(\d+)$/.exec(String(id ?? ''));
  return match ? Number(match[1]) : 0;
}

/** The ID the app shows for the server's number: 7 becomes `RP-0007` (FR-ADD-04). */
export function formatId(number) {
  return `RP-${String(number).padStart(4, '0')}`;
}

/**
 * A property as the server sends it, turned into the app's shape.
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
export function fromServer(row) {
  const property = {};
  const amenities = {};
  for (const [key, value] of Object.entries(row)) {
    if (AMENITY_KEYS.includes(key)) amenities[key] = Boolean(value);
    else property[key] = value ?? '';
  }
  return { ...property, id: formatId(row.id), amenities };
}

/**
 * The form's values, checked and tidied, in the shape the server expects.
 * @param {Record<string, unknown>} values Values that `validateProperty` accepted.
 * @returns {Record<string, unknown>}
 */
export function toServer(values) {
  const { amenities, ...fields } = normaliseValues(values);
  const body = { ...amenities };
  for (const [key, value] of Object.entries(fields)) {
    body[key] = value === '' ? null : value;
  }
  return body;
}

/**
 * One call to the server. Resolves with the parsed JSON, or null for an empty answer.
 * @param {string} path Added to `/api/v1/properties`.
 * @param {{ method?: string, body?: unknown, id?: string }} [options] `id` names the property a
 *   404 is about.
 */
async function request(path, { method = 'GET', body, id } = {}) {
  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // The server is not running, or the network is down.
    throw new Error(TEXT.serverUnavailable);
  }

  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  const answer = await response.json().catch(() => ({}));
  if (response.status === 400 && answer?.errors) {
    throw new ValidationError(answer.errors);
  }
  if (response.status === 404) throw new NotFoundError(id);
  // Vite's proxy also answers 5xx when the Spring server is not running.
  throw new Error(TEXT.serverUnavailable);
}

/**
 * Every property, for the Dashboard, the detail page and the search.
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function list() {
  // ponytail: one request of up to 1000. Loop over pages if the portfolio ever grows past that.
  const answer = await request('?page=0&size=1000');
  return answer.content.map(fromServer);
}

/**
 * One page of properties, newest first, as the server cuts it (Part 2 brief, requirement 4).
 * @param {number} page Counted from 1, as the user sees it. The server counts from 0.
 * @param {number} perPage
 * @returns {Promise<{ items: Array<Record<string, unknown>>, page: number, pageCount: number,
 *   from: number, to: number, total: number }>} The same shape as `paginate` in `utils/sort.js`,
 *   plus `total`.
 */
export async function listPage(page, perPage) {
  const answer = await request(`?page=${page - 1}&size=${perPage}`);
  const items = answer.content.map(fromServer);
  const total = answer.page.totalElements;
  const start = (page - 1) * perPage;
  return {
    items,
    page,
    pageCount: Math.max(1, answer.page.totalPages),
    from: items.length === 0 ? 0 : start + 1,
    to: start + items.length,
    total,
  };
}

/**
 * One property by ID.
 * @param {string} id
 * @returns {Promise<Record<string, unknown>>} Rejects with NotFoundError when no property has it.
 */
export async function getById(id) {
  if (idNumber(id) === 0) throw new NotFoundError(id);
  return fromServer(await request(`/${idNumber(id)}`, { id }));
}

/**
 * Add a property. The server sets the ID and both timestamps (FR-ADD-04).
 * @param {Record<string, unknown>} values Field values, without `id` or timestamps.
 * @returns {Promise<Record<string, unknown>>} Rejects with ValidationError when a check fails.
 */
export async function create(values) {
  // Checked here first, so a mistake never costs a round trip. The server checks again.
  const errors = validateProperty(values);
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
  return fromServer(
    await request('', { method: 'POST', body: toServer(values) }),
  );
}

/**
 * Change a property. The server keeps `id` and `createdAt` and sets `updatedAt` (FR-UPD-03).
 * @param {string} id
 * @param {Record<string, unknown>} values
 * @returns {Promise<Record<string, unknown>>} Rejects when the ID is unknown or a check fails.
 */
export async function update(id, values) {
  if (idNumber(id) === 0) throw new NotFoundError(id);
  const errors = validateProperty(values);
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
  return fromServer(
    await request(`/${idNumber(id)}`, {
      method: 'PUT',
      body: toServer(values),
      id,
    }),
  );
}

/**
 * Delete a property (FR-DEL-03).
 * @param {string} id
 * @returns {Promise<{ id: string }>} Rejects with NotFoundError when the ID is unknown.
 */
export async function remove(id) {
  if (idNumber(id) === 0) throw new NotFoundError(id);
  await request(`/${idNumber(id)}`, { method: 'DELETE', id });
  return { id };
}
