import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { TEXT } from '../constants/messages.js';
import * as propertyService from '../services/propertyService.js';
import { validValues } from '../test/fixtures.js';
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

/**
 * Grow the portfolio past one page, before the provider reads it. Each new property is newer than
 * every seeded one, so newest first puts them all on page 1.
 * @returns {Promise<string[]>} The new IDs.
 */
async function addProperties(count) {
  const ids = [];
  for (let index = 1; index <= count; index += 1) {
    const created = await propertyService.create(
      validValues({ district: `Paging District ${index}` }),
    );
    ids.push(created.id);
  }
  return ids;
}

/** The data rows of the table, without its header row. */
function dataRows() {
  return screen.getAllByRole('row').slice(1);
}

describe('PropertyListPage: pages (FR-LST-10, Part 2 brief requirement 4)', () => {
  it('shows 10 properties a page, newest first, and moves with Next and Previous', async () => {
    const seeded = await propertyService.list();
    const added = await addProperties(5);
    const total = seeded.length + added.length;
    const user = userEvent.setup();
    await renderList();

    expect(dataRows()).toHaveLength(10);
    for (const id of added) {
      expect(screen.getByRole('rowheader', { name: id })).toBeInTheDocument();
    }
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(total - 10);
    expect(
      screen.getByText(`(11 to ${total} of ${total})`),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument(),
    );
  });

  it('shows 25 a page when asked, from page 1', async () => {
    const seeded = await propertyService.list();
    await addProperties(5);
    const user = userEvent.setup();
    await renderList();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument(),
    );

    await user.selectOptions(screen.getByLabelText('Per page'), '25');

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(seeded.length + 5);
  });

  it('pages the 8 starting properties when 5 a page is chosen, for the demo', async () => {
    const seeded = await propertyService.list();
    const user = userEvent.setup();
    await renderList();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Per page'), '5');

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(seeded.length - 5);
  });

  it('goes back to page 1 when the search changes, and pages the matches', async () => {
    const added = await addProperties(5);
    const user = userEvent.setup();
    await renderList();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument(),
    );

    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      'Paging',
    );

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(added.length);
  });

  it('shows the last page that is left after deleting the only row on the last page', async () => {
    const seeded = await propertyService.list();
    // One more than fits on page 1, so page 2 holds a single row: the oldest property.
    await addProperties(11 - seeded.length);
    const user = userEvent.setup();
    await renderList();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument(),
    );
    const [onlyRow] = dataRows();
    const id = within(onlyRow).getByRole('rowheader').textContent;

    await user.click(screen.getByRole('button', { name: `Delete ${id}` }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    );

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument(),
    );
    expect(dataRows()).toHaveLength(10);
  });
});

describe('PropertyListPage: the search lives in the URL (FR-SRC-12)', () => {
  it('opens already narrowed when the URL carries a filter, with a chip to undo it', async () => {
    const vacant = (await propertyService.list()).filter(
      (property) => property.status === 'Vacant',
    );
    expect(vacant.length).toBeGreaterThan(0);

    renderRoutes(routes, { initialEntries: ['/properties?status=Vacant'] });
    await waitFor(() =>
      expect(screen.queryByText('Loading properties…')).not.toBeInTheDocument(),
    );

    expect(screen.getByRole('checkbox', { name: 'Vacant' })).toBeChecked();
    expect(
      screen.getByRole('button', { name: 'Remove filter: Vacant' }),
    ).toBeInTheDocument();
    expect(dataRows()).toHaveLength(vacant.length);
  });

  it('writes a filter to the URL, and removes it again with its chip', async () => {
    const user = userEvent.setup();
    const { router } = await renderList();

    await user.click(screen.getByRole('checkbox', { name: 'Riyadh' }));
    await waitFor(() =>
      expect(router.state.location.search).toBe('?city=Riyadh'),
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove filter: Riyadh' }),
    );
    await waitFor(() => expect(router.state.location.search).toBe(''));
    expect(screen.getByRole('checkbox', { name: 'Riyadh' })).not.toBeChecked();
  });

  it('sorts by the chosen field and keeps the choice in the URL (FR-SRC-09)', async () => {
    const user = userEvent.setup();
    const { router } = await renderList();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sort by' }),
      'Yearly rent',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Order' }),
      'Ascending',
    );

    await waitFor(() =>
      expect(router.state.location.search).toBe('?sort=yearlyRentSar&dir=asc'),
    );
    const rents = (await propertyService.list())
      .map((property) => property.yearlyRentSar)
      .sort((left, right) => left - right);
    const firstRow = dataRows()[0];
    expect(firstRow).toHaveTextContent(
      new Intl.NumberFormat('en-US').format(rents[0]),
    );
  });
});
