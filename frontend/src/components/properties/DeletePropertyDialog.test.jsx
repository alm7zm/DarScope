import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MESSAGES, TEXT } from '../../constants/messages.js';
import * as propertyService from '../../services/propertyService.js';
import { renderRoutes } from '../../test/render.jsx';
import { routes } from '../../routes/routes.jsx';

beforeEach(() => {
  propertyService.__resetForTests();
});

/** Open the app at a URL and wait for the portfolio to arrive. */
async function openApp(url) {
  const user = userEvent.setup();
  const result = renderRoutes(routes, { initialEntries: [url] });
  await waitFor(() =>
    expect(screen.queryByText(/^Loading/)).not.toBeInTheDocument(),
  );
  return { user, ...result };
}

describe('Delete from a list row (FR-DEL-01, FR-DEL-02)', () => {
  it('names the property by ID, type, district and city before deleting it', async () => {
    const property = await propertyService.getById('RP-0001');
    const { user } = await openApp('/properties');

    await user.click(screen.getByRole('button', { name: 'Delete RP-0001' }));

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('RP-0001')).toBeInTheDocument();
    expect(
      dialog.getByText(
        `${property.propertyType} in ${property.district}, ${property.city}`,
      ),
    ).toBeInTheDocument();
  });

  it('offers Cancel and Delete, with Cancel focused first', async () => {
    const { user } = await openApp('/properties');

    await user.click(screen.getByRole('button', { name: 'Delete RP-0001' }));

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(dialog.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});

describe('AC-07 delete with confirmation', () => {
  it('keeps the property after Cancel, and removes it after confirming', async () => {
    const before = await propertyService.list();
    const { user } = await openApp('/properties');

    // Cancel first: the property must still be there.
    await user.click(screen.getByRole('button', { name: 'Delete RP-0005' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancel',
      }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await propertyService.list()).toHaveLength(before.length);
    expect(
      screen.getByRole('rowheader', { name: 'RP-0005' }),
    ).toBeInTheDocument();

    // Then confirm.
    await user.click(screen.getByRole('button', { name: 'Delete RP-0005' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );

    // It is gone from the list at once (FR-DEL-03).
    await waitFor(() =>
      expect(
        screen.queryByRole('rowheader', { name: 'RP-0005' }),
      ).not.toBeInTheDocument(),
    );
    expect(await propertyService.list()).toHaveLength(before.length - 1);

    // The count falls with it (FR-LST-04).
    expect(
      screen.getByText(
        `Showing ${before.length - 1} of ${before.length - 1} properties`,
      ),
    ).toBeInTheDocument();

    // And the confirmation names the property (FR-DEL-04).
    expect(screen.getByText(MESSAGES.deleted('RP-0005'))).toBeInTheDocument();
  });

  it('then shows "Property not found" at the deleted URL (FR-DET-03)', async () => {
    await propertyService.remove('RP-0005');

    await openApp('/properties/RP-0005');

    expect(
      screen.getByRole('heading', { level: 1, name: TEXT.propertyNotFound }),
    ).toBeInTheDocument();
  });
});

describe('Esc cancels the confirmation (FR-DEL-02, NFR-ACC-06)', () => {
  it('closes the dialog and keeps the property', async () => {
    const before = await propertyService.list();
    const { user } = await openApp('/properties');

    await user.click(screen.getByRole('button', { name: 'Delete RP-0001' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await propertyService.list()).toHaveLength(before.length);
  });
});

describe('Delete from the detail page (FR-DEL-01, FR-DEL-05)', () => {
  it('offers Delete beside Edit and Back to list (FR-DET-02)', async () => {
    await openApp('/properties/RP-0001');

    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
    expect(main.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(
      main.getByRole('link', { name: 'Back to list' }),
    ).toBeInTheDocument();
  });

  it('returns to the list after the delete is confirmed', async () => {
    const before = await propertyService.list();
    const { user, router } = await openApp('/properties/RP-0003');

    await user.click(
      within(screen.getByRole('main')).getByRole('button', { name: 'Delete' }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/properties'),
    );
    expect(await propertyService.list()).toHaveLength(before.length - 1);
    expect(screen.getByText(MESSAGES.deleted('RP-0003'))).toBeInTheDocument();
  });

  it('stays on the property when the delete is cancelled', async () => {
    const { user, router } = await openApp('/properties/RP-0003');

    await user.click(
      within(screen.getByRole('main')).getByRole('button', { name: 'Delete' }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancel',
      }),
    );

    expect(router.state.location.pathname).toBe('/properties/RP-0003');
    expect(await propertyService.getById('RP-0003')).toBeTruthy();
  });
});

describe('AC-08 a deleted ID is never reissued (FR-DEL-06)', () => {
  it('gives the next new property the following ID, not the freed one', async () => {
    const before = await propertyService.list();
    const lastId = before.at(-1).id;
    const { user } = await openApp('/properties');

    await user.click(screen.getByRole('button', { name: `Delete ${lastId}` }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );
    await waitFor(() =>
      expect(screen.getByText(MESSAGES.deleted(lastId))).toBeInTheDocument(),
    );

    const created = await propertyService.create({
      ...before[0],
      district: 'Al Rabwah',
    });
    expect(created.id).not.toBe(lastId);
  });
});
