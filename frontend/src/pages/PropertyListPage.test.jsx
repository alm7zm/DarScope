import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { TEXT } from '../constants/messages.js';
import * as propertyService from '../services/propertyService.js';
import { renderRoutes } from '../test/render.jsx';
import { routes } from '../routes/routes.jsx';

beforeEach(() => {
  propertyService.__resetForTests();
});

/** Render the real app at the list URL and wait for the portfolio to arrive. */
async function renderList() {
  const result = renderRoutes(routes, { initialEntries: ['/properties'] });
  await waitFor(() =>
    expect(screen.queryByText('Loading properties…')).not.toBeInTheDocument(),
  );
  return result;
}

/** Empty the portfolio through the service, before the provider reads it. */
async function emptyThePortfolio() {
  const properties = await propertyService.list();
  for (const property of properties) {
    await propertyService.remove(property.id);
  }
}

describe('PropertyListPage (SRS 4.3)', () => {
  it('names the page and sets the tab title (UI-02)', async () => {
    await renderList();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Properties' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Properties · Darscope');
  });

  it('lists every property in the portfolio (FR-LST-01)', async () => {
    await renderList();

    const seeded = await propertyService.list();
    // One row per property, plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(seeded.length + 1);
    for (const property of seeded) {
      expect(
        screen.getByRole('rowheader', { name: property.id }),
      ).toBeInTheDocument();
    }
  });

  it('counts what is shown against the whole portfolio (FR-LST-04)', async () => {
    await renderList();

    const seeded = await propertyService.list();
    expect(
      screen.getByText(
        `Showing ${seeded.length} of ${seeded.length} properties`,
      ),
    ).toBeInTheDocument();
  });
});

describe('PropertyListPage: an empty portfolio (FR-LST-05)', () => {
  it('shows the message from Appendix C and a way to add the first property', async () => {
    await emptyThePortfolio();
    await renderList();

    expect(screen.getByText(TEXT.emptyPortfolio)).toBeInTheDocument();
    // The menu also holds an "Add property" link, so look inside the page itself.
    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'Add property',
      }),
    ).toHaveAttribute('href', '/properties/new');
  });

  it('shows no table when there is nothing to put in it', async () => {
    await emptyThePortfolio();
    await renderList();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 0 of 0 properties')).toBeInTheDocument();
  });
});
