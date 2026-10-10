import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FIELD_ERRORS, TEXT } from '../constants/messages.js';
import { validValues } from '../test/fixtures.js';
import {
  NotFoundError,
  ValidationError,
  __resetForTests,
  create,
  getById,
  list,
  remove,
  reset,
  restore,
  update,
} from './propertyService.js';

/** A fixed moment, so timestamp checks never depend on the real clock (testing rules). */
const NOW = '2026-10-10T12:00:00.000Z';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  __resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('list (FR-DAT-01)', () => {
  it('returns the seeded portfolio', async () => {
    const properties = await list();
    expect(properties.length).toBeGreaterThan(0);
    expect(properties[0].id).toBe('RP-0001');
  });

  it('gives back a copy, so a caller cannot change the stored collection (NFR-REL-04)', async () => {
    const properties = await list();
    properties[0].city = 'Mecca';
    properties.push({ id: 'RP-9999' });

    const again = await list();
    expect(again[0].city).not.toBe('Mecca');
    expect(again).toHaveLength(properties.length - 1);
  });

  it('copies nested values too', async () => {
    const [first] = await list();
    first.amenities.pool = !first.amenities.pool;

    const [again] = await list();
    expect(again.amenities.pool).not.toBe(first.amenities.pool);
  });
});

describe('getById', () => {
  it('returns the property with that ID', async () => {
    const property = await getById('RP-0002');
    expect(property.id).toBe('RP-0002');
  });

  it('rejects an unknown ID with the message in Appendix C (FR-DET-03)', async () => {
    await expect(getById('RP-9999')).rejects.toBeInstanceOf(NotFoundError);
    await expect(getById('RP-9999')).rejects.toThrow(TEXT.propertyNotFound);
  });
});

describe('create (FR-ADD-04, FR-ADD-06)', () => {
  it('gives the new property an unused ID and both timestamps', async () => {
    const before = await list();
    const property = await create(validValues({ district: 'Al Rabwah' }));

    expect(property.id).toMatch(/^RP-\d{4}$/);
    expect(before.map((p) => p.id)).not.toContain(property.id);
    expect(property.createdAt).toBe(NOW);
    expect(property.updatedAt).toBe(NOW);
  });

  it('puts the property in the list at once', async () => {
    const property = await create(validValues({ district: 'Al Rabwah' }));
    const properties = await list();
    expect(properties.map((p) => p.id)).toContain(property.id);
  });

  it('stores the normalised values, not the raw ones', async () => {
    const property = await create(
      validValues({ district: '  Al Rabwah  ', sizeSqm: '450' }),
    );
    expect(property.district).toBe('Al Rabwah');
    expect(property.sizeSqm).toBe(450);
  });

  it('rejects invalid input and carries a message per field (NFR-REL-03)', async () => {
    const promise = create(validValues({ city: '', yearlyRentSar: 10 }));
    await expect(promise).rejects.toBeInstanceOf(ValidationError);

    const error = await promise.catch((caught) => caught);
    expect(error.errors.city).toBe(FIELD_ERRORS.cityRequired);
    expect(error.errors.yearlyRentSar).toBe(FIELD_ERRORS.rentRange);
  });

  it('saves nothing when a check fails (FR-ADD-03)', async () => {
    const before = await list();
    await create(validValues({ city: '' })).catch(() => {});
    expect(await list()).toHaveLength(before.length);
  });

  it('clears tenant and lease details for a property that is not Occupied', async () => {
    const property = await create(
      validValues({ status: 'Vacant', tenantName: 'Nora Al Harbi' }),
    );
    expect(property.tenantName).toBe('');
  });

  it('issues a different ID to each new property (FR-DAT-04)', async () => {
    const first = await create(validValues({ district: 'One' }));
    const second = await create(validValues({ district: 'Two' }));
    expect(first.id).not.toBe(second.id);
  });
});

describe('update (FR-UPD-03)', () => {
  it('keeps the ID and createdAt, and moves updatedAt on', async () => {
    const before = await getById('RP-0001');

    vi.setSystemTime(new Date('2026-10-11T08:00:00.000Z'));
    const property = await update(
      'RP-0001',
      validValues({ district: 'Al Rabwah' }),
    );

    expect(property.id).toBe('RP-0001');
    expect(property.createdAt).toBe(before.createdAt);
    expect(property.updatedAt).toBe('2026-10-11T08:00:00.000Z');
    expect(property.updatedAt).not.toBe(before.updatedAt);
  });

  it('shows the new values in the list at once (FR-UPD-05)', async () => {
    await update('RP-0001', validValues({ district: 'Al Rabwah' }));
    const properties = await list();
    const updated = properties.find((p) => p.id === 'RP-0001');
    expect(updated.district).toBe('Al Rabwah');
  });

  it('rejects an unknown ID', async () => {
    await expect(update('RP-9999', validValues())).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('applies the same checks as adding (FR-UPD-02)', async () => {
    await expect(
      update('RP-0001', validValues({ sizeSqm: 5 })),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('changes nothing when a check fails', async () => {
    const before = await getById('RP-0001');
    await update('RP-0001', validValues({ sizeSqm: 5 })).catch(() => {});
    expect(await getById('RP-0001')).toEqual(before);
  });

  it('clears tenant and lease details when the status leaves Occupied (FR-UPD-07)', async () => {
    await update(
      'RP-0001',
      validValues({
        status: 'Occupied',
        tenantName: 'Nora Al Harbi',
        leaseStart: '2026-01-01',
        leaseEnd: '2026-12-31',
      }),
    );

    const property = await update('RP-0001', validValues({ status: 'Vacant' }));
    expect(property.tenantName).toBe('');
    expect(property.leaseStart).toBe('');
    expect(property.leaseEnd).toBe('');
  });
});

describe('remove (FR-DEL-03)', () => {
  it('returns the removed property and takes it out of the list', async () => {
    const removed = await remove('RP-0002');
    expect(removed.id).toBe('RP-0002');

    const properties = await list();
    expect(properties.map((p) => p.id)).not.toContain('RP-0002');
  });

  it('rejects an unknown ID', async () => {
    await expect(remove('RP-9999')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('AC-08 never gives a deleted ID to a new property (FR-DEL-06)', async () => {
    const before = await list();
    const lastId = before.at(-1).id;

    await remove(lastId);
    const created = await create(validValues({ district: 'Al Rabwah' }));

    expect(created.id).not.toBe(lastId);
  });

  it('never reuses an ID even after every property is deleted', async () => {
    const before = await list();
    for (const property of before) {
      await remove(property.id);
    }
    expect(await list()).toHaveLength(0);

    const created = await create(validValues({ district: 'Al Rabwah' }));
    expect(before.map((p) => p.id)).not.toContain(created.id);
  });
});

describe('restore (FR-DEL-07)', () => {
  it('puts the property back with the same ID and values', async () => {
    const removed = await remove('RP-0002');
    const restored = await restore(removed);

    expect(restored).toEqual(removed);
    const properties = await list();
    expect(properties.map((p) => p.id)).toContain('RP-0002');
  });

  it('puts the row back in ID order rather than at the end', async () => {
    const removed = await remove('RP-0002');
    await restore(removed);

    const ids = (await list()).map((p) => p.id);
    expect(ids.indexOf('RP-0002')).toBe(1);
  });

  it('refuses to restore an ID that is already in the portfolio', async () => {
    const existing = await getById('RP-0001');
    await expect(restore(existing)).rejects.toThrow(/already exists/);
  });
});

describe('reset (FR-DAT-05)', () => {
  it('brings the seed back', async () => {
    await remove('RP-0001');
    await create(validValues({ district: 'Al Rabwah' }));

    const properties = await reset();
    expect(properties.map((p) => p.id)).toContain('RP-0001');
    expect(properties.every((p) => /^RP-000[1-8]$/.test(p.id))).toBe(true);
  });

  it('still does not reissue an ID used before the reset (FR-DEL-06)', async () => {
    const created = await create(validValues({ district: 'Al Rabwah' }));
    await reset();

    const afterReset = await create(validValues({ district: 'Al Nakheel' }));
    expect(afterReset.id).not.toBe(created.id);
  });
});
