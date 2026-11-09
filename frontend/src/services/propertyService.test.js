/**
 * The HTTP data service, with `fetch` replaced by a stub: no test reaches a real server. The rules
 * the server enforces (IDs never reused, timestamps) are the backend's own JUnit tests; these
 * check what this module does: the routes it calls, the shape it sends, the shape it returns, and
 * how it reports failures. The routes come from `docs/backend-plan.md`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FIELD_ERRORS, TEXT } from '../constants/messages.js';
import { validValues } from '../test/fixtures.js';
import {
  NotFoundError,
  ValidationError,
  create,
  formatId,
  getById,
  idNumber,
  list,
  listPage,
  remove,
  update,
} from './propertyService.js';

// `test/setup.js` swaps this module for an in-memory fake everywhere else. Here we want the real one.
vi.unmock('./propertyService.js');

/** A property as the Spring server sends it: numeric ID, flat amenities, null for empty. */
function serverRow(overrides = {}) {
  return {
    id: 7,
    city: 'Riyadh',
    district: 'Al Malqa',
    front: null,
    propertyType: 'Villa',
    sizeSqm: 450,
    propertyAgeYears: 5,
    bedrooms: 4,
    bathrooms: 3,
    livingRooms: 2,
    kitchen: true,
    garage: false,
    driverRoom: false,
    maidRoom: false,
    furnished: false,
    ac: true,
    roof: false,
    pool: true,
    frontyard: false,
    basement: false,
    stairs: false,
    elevator: false,
    fireplace: false,
    yearlyRentSar: 120000,
    description: null,
    status: 'Vacant',
    tenantName: null,
    leaseStart: null,
    leaseEnd: null,
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
    ...overrides,
  };
}

/** A page as Spring's `PagedModel` sends it. */
function serverPage(
  content,
  { number = 0, size = 10, totalElements, totalPages } = {},
) {
  return {
    content,
    page: {
      size,
      number,
      totalElements: totalElements ?? content.length,
      totalPages: totalPages ?? Math.ceil(content.length / size),
    },
  };
}

/** The server's answer to the next call. */
function answer(status, body) {
  fetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () =>
      body === undefined
        ? Promise.reject(new SyntaxError('empty body'))
        : Promise.resolve(body),
  });
}

/** The URL, method and parsed body of the one call made. */
function onlyCall() {
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, options] = fetch.mock.calls[0];
  return {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body === undefined ? undefined : JSON.parse(options.body),
  };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('IDs', () => {
  it('shows the server number as RP plus four digits (FR-ADD-04)', () => {
    expect(formatId(7)).toBe('RP-0007');
    expect(formatId(41)).toBe('RP-0041');
    expect(formatId(12345)).toBe('RP-12345');
  });

  it('reads the server number back out of an ID, and 0 for anything else', () => {
    expect(idNumber('RP-0007')).toBe(7);
    expect(idNumber('RP-0041')).toBe(41);
    expect(idNumber('7')).toBe(0);
    expect(idNumber('abc')).toBe(0);
    expect(idNumber(undefined)).toBe(0);
  });
});

describe('list', () => {
  it('asks for every property and turns each into the app shape', async () => {
    answer(200, serverPage([serverRow()], { size: 1000 }));

    const properties = await list();

    expect(onlyCall()).toMatchObject({
      url: '/api/v1/properties?page=0&size=1000',
      method: 'GET',
    });
    expect(properties).toHaveLength(1);
    const [property] = properties;
    expect(property.id).toBe('RP-0007');
    expect(property.amenities).toMatchObject({
      kitchen: true,
      ac: true,
      pool: true,
      garage: false,
    });
    expect(Object.keys(property.amenities)).toHaveLength(13);
    expect(property).not.toHaveProperty('kitchen');
    // Empty fields come back as empty text, which is what the pages expect.
    expect(property.front).toBe('');
    expect(property.tenantName).toBe('');
    expect(property.leaseEnd).toBe('');
    expect(property.sizeSqm).toBe(450);
    expect(property.updatedAt).toBe('2026-11-02T09:00:00Z');
  });

  it('reports a server that cannot be reached', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(list()).rejects.toThrow(TEXT.serverUnavailable);
  });

  it('reports a server error, which is also what the proxy answers when Spring is down', async () => {
    answer(500, undefined);

    await expect(list()).rejects.toThrow(TEXT.serverUnavailable);
  });
});

describe('listPage', () => {
  it('asks the server for one page, counting pages from 0 on the wire and from 1 in the app', async () => {
    const rows = [serverRow({ id: 11 }), serverRow({ id: 12 })];
    answer(
      200,
      serverPage(rows, { number: 1, totalElements: 12, totalPages: 2 }),
    );

    const page = await listPage(2, 10);

    expect(onlyCall()).toMatchObject({
      url: '/api/v1/properties?page=1&size=10',
      method: 'GET',
    });
    expect(page).toMatchObject({
      page: 2,
      pageCount: 2,
      from: 11,
      to: 12,
      total: 12,
    });
    expect(page.items.map((property) => property.id)).toEqual([
      'RP-0011',
      'RP-0012',
    ]);
  });

  it('still has one page when the portfolio is empty', async () => {
    answer(200, serverPage([], { totalElements: 0, totalPages: 0 }));

    const page = await listPage(1, 10);

    expect(page).toMatchObject({
      items: [],
      page: 1,
      pageCount: 1,
      from: 0,
      to: 0,
      total: 0,
    });
  });
});

describe('getById', () => {
  it('asks for the property by its server number', async () => {
    answer(200, serverRow());

    const property = await getById('RP-0007');

    expect(onlyCall()).toMatchObject({
      url: '/api/v1/properties/7',
      method: 'GET',
    });
    expect(property.id).toBe('RP-0007');
  });

  it('turns a 404 into "Property not found" (FR-DET-03)', async () => {
    answer(404, { message: 'Property not found' });

    const failure = getById('RP-0099');

    await expect(failure).rejects.toBeInstanceOf(NotFoundError);
    await expect(failure).rejects.toMatchObject({
      id: 'RP-0099',
      message: TEXT.propertyNotFound,
    });
  });

  it('does not ask the server about an ID that cannot exist', async () => {
    await expect(getById('nonsense')).rejects.toBeInstanceOf(NotFoundError);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('create', () => {
  it('posts the values in the server shape and returns the new property', async () => {
    answer(201, serverRow({ id: 9, district: 'Al Rabwah' }));

    const created = await create(
      validValues({ district: '  Al Rabwah  ', front: '', description: '' }),
    );

    const call = onlyCall();
    expect(call).toMatchObject({
      url: '/api/v1/properties',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    // Trimmed, flat amenities, empty text sent as null, and never an ID or a timestamp.
    expect(call.body).toMatchObject({
      district: 'Al Rabwah',
      front: null,
      description: null,
      tenantName: null,
      kitchen: false,
      sizeSqm: 450,
    });
    expect(call.body).not.toHaveProperty('amenities');
    expect(call.body).not.toHaveProperty('id');
    expect(call.body).not.toHaveProperty('createdAt');
    expect(created.id).toBe('RP-0009');
  });

  it('clears tenant and lease details unless the status is Occupied (FR-UPD-07)', async () => {
    answer(201, serverRow());

    await create(
      validValues({
        status: 'Vacant',
        tenantName: 'Nora Al Harbi',
        leaseStart: '2026-01-01',
      }),
    );

    expect(onlyCall().body).toMatchObject({
      tenantName: null,
      leaseStart: null,
      leaseEnd: null,
    });
  });

  it('rejects invalid values without calling the server (NFR-REL-03)', async () => {
    const failure = create(validValues({ yearlyRentSar: 500 }));

    await expect(failure).rejects.toBeInstanceOf(ValidationError);
    await expect(failure).rejects.toMatchObject({
      errors: { yearlyRentSar: FIELD_ERRORS.rentRange },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('passes on the field messages the server sends with a 400', async () => {
    answer(400, { errors: { district: FIELD_ERRORS.districtLength } });

    const failure = create(validValues());

    await expect(failure).rejects.toBeInstanceOf(ValidationError);
    await expect(failure).rejects.toMatchObject({
      errors: { district: FIELD_ERRORS.districtLength },
    });
  });
});

describe('update', () => {
  it('puts the values to the property by its server number', async () => {
    answer(200, serverRow({ id: 1, district: 'Changed' }));

    const updated = await update(
      'RP-0001',
      validValues({ district: 'Changed' }),
    );

    const call = onlyCall();
    expect(call).toMatchObject({ url: '/api/v1/properties/1', method: 'PUT' });
    expect(call.body.district).toBe('Changed');
    expect(updated).toMatchObject({ id: 'RP-0001', district: 'Changed' });
  });

  it('turns a 404 into "Property not found"', async () => {
    answer(404, { message: 'Property not found' });

    await expect(update('RP-0099', validValues())).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('rejects invalid values without calling the server', async () => {
    await expect(
      update('RP-0001', validValues({ status: 'Occupied', tenantName: '' })),
    ).rejects.toMatchObject({
      errors: { tenantName: FIELD_ERRORS.tenantNameRequired },
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('deletes the property by its server number', async () => {
    answer(204, undefined);

    const removed = await remove('RP-0003');

    expect(onlyCall()).toMatchObject({
      url: '/api/v1/properties/3',
      method: 'DELETE',
    });
    expect(removed).toEqual({ id: 'RP-0003' });
  });

  it('turns a 404 into "Property not found"', async () => {
    answer(404, { message: 'Property not found' });

    await expect(remove('RP-0099')).rejects.toBeInstanceOf(NotFoundError);
  });
});
