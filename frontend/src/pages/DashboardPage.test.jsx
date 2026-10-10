import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { TEXT } from '../constants/messages.js';
import * as propertyService from '../services/propertyService.js';
import { validValues } from '../test/fixtures.js';
import { renderRoutes } from '../test/render.jsx';
import { routes } from '../routes/routes.jsx';
import { summarise } from '../utils/stats.js';

beforeEach(() => {
  propertyService.__resetForTests();
});

async function openDashboard() {
  const user = userEvent.setup();
  const result = renderRoutes(routes, { initialEntries: ['/'] });
  await waitFor(() =>
    expect(
      screen.queryByText('Loading the portfolio…'),
    ).not.toBeInTheDocument(),
  );
  return { user, ...result };
}

/** The value shown under a label, wherever it sits on the page. */
function figure(label) {
  return screen.getByText(label).closest('div')?.textContent ?? '';
}

async function emptyThePortfolio() {
  for (const property of await propertyService.list()) {
    await propertyService.remove(property.id);
  }
}

describe('DashboardPage: the headline figures (FR-DSH-01)', () => {
  it('names the page and sets the tab title', async () => {
    await openDashboard();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Dashboard · Darscope');
  });

  it('shows the total, the three status counts, the rate and both rent figures', async () => {
    const summary = summarise(await propertyService.list());
    await openDashboard();

    expect(figure('Total properties')).toContain(String(summary.total));
    expect(figure('Occupancy rate')).toContain(`${summary.occupancyRate}%`);
    expect(figure('Rent from occupied')).toContain('SAR');
    expect(figure('Potential rent')).toContain('SAR');

    // The status counts come through their badges. "Occupied" also appears as a city-table
    // column and on the attention list, so this looks inside the By status section only.
    const byStatus = within(
      screen.getByRole('heading', { name: 'By status' }).closest('section'),
    );
    expect(byStatus.getByText('Occupied')).toBeInTheDocument();
    expect(byStatus.getByText('Vacant')).toBeInTheDocument();
    expect(byStatus.getByText('Under maintenance')).toBeInTheDocument();
    expect(byStatus.getByText(String(summary.occupied))).toBeInTheDocument();
  });

  it('writes both rent figures with separators and SAR (FR-LST-06)', async () => {
    const summary = summarise(await propertyService.list());
    await openDashboard();

    expect(
      screen.getByText(
        `${summary.rentFromOccupied.toLocaleString('en-US')} SAR`,
      ),
    ).toBeInTheDocument();
  });
});

describe('DashboardPage: AC-14 the figures follow a change (FR-DSH-03)', () => {
  it('raises the total, the occupied count and the occupied rent after an add', async () => {
    const before = summarise(await propertyService.list());
    const { user } = await openDashboard();

    // Add one occupied property worth 60,000 through the form, as a user would.
    await user.click(screen.getByRole('link', { name: 'Add property' }));

    const field = (label) =>
      screen.getByLabelText(
        (name) => name.replace(/\s*\(required\)$/, '').trim() === label,
      );

    await user.selectOptions(field('City'), 'Riyadh');
    await user.type(field('District'), 'Al Rabwah');
    await user.type(field('Size (m²)'), '400');
    await user.type(field('Age (years)'), '3');
    await user.type(field('Bedrooms'), '5');
    await user.type(field('Bathrooms'), '4');
    await user.type(field('Living rooms'), '2');
    await user.type(field('Yearly rent (SAR)'), '60000');
    await user.selectOptions(field('Status'), 'Occupied');
    await user.type(field('Tenant name'), 'Sara Al Otaibi');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByText(/added$/)).toBeInTheDocument());

    // Back to the Dashboard: every figure has moved.
    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole(
        'link',
        { name: 'Dashboard' },
      ),
    );

    expect(figure('Total properties')).toContain(String(before.total + 1));
    expect(
      screen.getByText(
        `${(before.rentFromOccupied + 60000).toLocaleString('en-US')} SAR`,
      ),
    ).toBeInTheDocument();
  });

  it('lowers the total after a delete', async () => {
    const before = await propertyService.list();
    await propertyService.remove(before[0].id);

    await openDashboard();
    expect(figure('Total properties')).toContain(String(before.length - 1));
  });
});

describe('DashboardPage: an empty portfolio (FR-DSH-04, FR-DSH-02)', () => {
  it('shows zeros, a dash for the rate, and asks for a first property', async () => {
    await emptyThePortfolio();
    await openDashboard();

    expect(figure('Total properties')).toContain('0');
    // No properties means nothing to divide by, so a dash rather than 0%.
    expect(figure('Occupancy rate')).toContain('—');
    expect(screen.getByText(TEXT.emptyPortfolio)).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'Add property',
      }),
    ).toHaveAttribute('href', '/properties/new');
  });

  it('shows no city table and no attention list when there is nothing to list', async () => {
    await emptyThePortfolio();
    await openDashboard();

    expect(
      screen.queryByRole('heading', { name: 'By city' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Needs attention' }),
    ).not.toBeInTheDocument();
  });
});

describe('DashboardPage: the city table (FR-DSH-05)', () => {
  it('shows a row per city with properties, occupied and rent', async () => {
    await openDashboard();

    const table = within(
      screen.getByRole('heading', { name: 'By city' }).closest('section'),
    );
    expect(
      table.getByRole('columnheader', { name: 'Properties' }),
    ).toBeInTheDocument();
    expect(
      table.getByRole('columnheader', { name: 'Occupied' }),
    ).toBeInTheDocument();
    expect(
      table.getByRole('columnheader', { name: 'Yearly rent' }),
    ).toBeInTheDocument();
    expect(
      table.getByRole('rowheader', { name: 'Riyadh' }),
    ).toBeInTheDocument();
  });
});

describe('DashboardPage: needs attention (FR-DSH-06)', () => {
  it('lists every property that is not occupied, each linking to its page', async () => {
    const properties = await propertyService.list();
    const idle = properties.filter(
      (property) => property.status !== 'Occupied',
    );
    await openDashboard();

    const panel = within(
      screen
        .getByRole('heading', { name: 'Needs attention' })
        .closest('section'),
    );

    expect(panel.getAllByRole('listitem')).toHaveLength(idle.length);
    for (const property of idle) {
      expect(
        panel.getByRole('link', { name: new RegExp(property.id) }),
      ).toHaveAttribute('href', `/properties/${property.id}`);
    }
  });

  it('leaves out the occupied ones', async () => {
    const occupied = (await propertyService.list()).find(
      (property) => property.status === 'Occupied',
    );
    await openDashboard();

    const panel = within(
      screen
        .getByRole('heading', { name: 'Needs attention' })
        .closest('section'),
    );
    expect(
      panel.queryByRole('link', { name: new RegExp(occupied.id) }),
    ).not.toBeInTheDocument();
  });

  it('says so when every property is occupied', async () => {
    for (const property of await propertyService.list()) {
      if (property.status !== 'Occupied') {
        await propertyService.update(property.id, {
          ...validValues(),
          status: 'Occupied',
          tenantName: 'Sara Al Otaibi',
        });
      }
    }

    await openDashboard();
    expect(screen.getByText(/Every property is occupied/)).toBeInTheDocument();
  });
});

describe('DashboardPage: shortcuts (FR-DSH-07)', () => {
  it('links to the full property list', async () => {
    await openDashboard();

    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'View all properties',
      }),
    ).toHaveAttribute('href', '/properties');
  });
});
