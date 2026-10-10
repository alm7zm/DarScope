import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { TEXT } from '../constants/messages.js';
import { AMENITIES } from '../constants/options.js';
import * as propertyService from '../services/propertyService.js';
import { renderRoutes } from '../test/render.jsx';
import { routes } from '../routes/routes.jsx';

beforeEach(() => {
  propertyService.__resetForTests();
});

/** Open the real app at one property's URL and wait for the portfolio to arrive. */
async function renderDetail(id) {
  const result = renderRoutes(routes, {
    initialEntries: [`/properties/${id}`],
  });
  await waitFor(() =>
    expect(screen.queryByText('Loading property…')).not.toBeInTheDocument(),
  );
  return result;
}

/** The value shown for a label inside the named group. */
function fieldValue(groupName, label) {
  const group = screen
    .getByRole('heading', { level: 2, name: groupName })
    .closest('section');
  return within(group).getByText(label).nextElementSibling;
}

describe('PropertyDetailPage: the six field groups (FR-DET-01)', () => {
  it('shows all six groups of SRS 4.4', async () => {
    await renderDetail('RP-0001');

    for (const group of [
      'Location',
      'Building',
      'Amenities',
      'Rent and tenancy',
      'Description',
      'Record',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: group }),
      ).toBeInTheDocument();
    }
  });

  it('names the page after the property, and sets the tab title (UI-02)', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderDetail('RP-0001');

    const title = `${property.propertyType} in ${property.district}, ${property.city}`;
    expect(
      screen.getByRole('heading', { level: 1, name: title }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${title} · Darscope`);
  });

  it('puts the location fields in the Location group', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderDetail('RP-0001');

    expect(fieldValue('Location', 'City')).toHaveTextContent(property.city);
    expect(fieldValue('Location', 'District')).toHaveTextContent(
      property.district,
    );
    expect(fieldValue('Location', 'Front')).toHaveTextContent(property.front);
  });

  it('writes the building figures with their units (FR-LST-06)', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderDetail('RP-0001');

    expect(fieldValue('Building', 'Type')).toHaveTextContent(
      property.propertyType,
    );
    expect(fieldValue('Building', 'Size')).toHaveTextContent('m²');
    expect(fieldValue('Building', 'Bedrooms')).toHaveTextContent(
      String(property.bedrooms),
    );
  });

  it('writes the rent with separators and SAR', async () => {
    await renderDetail('RP-0001');
    expect(fieldValue('Rent and tenancy', 'Yearly rent')).toHaveTextContent(
      'SAR',
    );
  });

  it('shows the record fields, including the ID', async () => {
    await renderDetail('RP-0001');

    expect(fieldValue('Record', 'ID')).toHaveTextContent('RP-0001');
    expect(fieldValue('Record', 'Created')).toHaveTextContent('UTC');
    expect(fieldValue('Record', 'Last updated')).toHaveTextContent('UTC');
  });

  it('lists the amenities the property has', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderDetail('RP-0001');

    const group = screen
      .getByRole('heading', { level: 2, name: 'Amenities' })
      .closest('section');

    for (const amenity of AMENITIES) {
      const shown = within(group).queryByText(amenity.label);
      if (property.amenities[amenity.key]) {
        expect(shown).toBeInTheDocument();
      } else {
        expect(shown).not.toBeInTheDocument();
      }
    }
  });
});

describe('PropertyDetailPage: tenancy appears only when Occupied (FR-DET-04)', () => {
  it('shows tenant and lease details for an occupied property', async () => {
    const occupied = (await propertyService.list()).find(
      (property) => property.status === 'Occupied',
    );
    await renderDetail(occupied.id);

    expect(fieldValue('Rent and tenancy', 'Tenant')).toHaveTextContent(
      occupied.tenantName,
    );
    expect(fieldValue('Rent and tenancy', 'Lease start')).not.toHaveTextContent(
      '—',
    );
    expect(fieldValue('Rent and tenancy', 'Lease end')).not.toHaveTextContent(
      '—',
    );
  });

  it.each(['Vacant', 'Under maintenance'])(
    'hides them for a %s property',
    async (status) => {
      const property = (await propertyService.list()).find(
        (candidate) => candidate.status === status,
      );
      await renderDetail(property.id);

      expect(screen.queryByText('Tenant')).not.toBeInTheDocument();
      expect(screen.queryByText('Lease start')).not.toBeInTheDocument();
      expect(screen.queryByText('Lease end')).not.toBeInTheDocument();
    },
  );
});

describe('PropertyDetailPage: Arabic text (FR-LST-07, NFR-ACC-07)', () => {
  it('marks an Arabic district and description with their language and direction', async () => {
    const arabic = (await propertyService.list()).find((property) =>
      /[؀-ۿ]/.test(property.district),
    );
    await renderDetail(arabic.id);

    const district = fieldValue('Location', 'District');
    expect(district).toHaveAttribute('dir', 'auto');
    expect(district).toHaveAttribute('lang', 'ar');
  });
});

describe('PropertyDetailPage: actions (FR-DET-02)', () => {
  it('offers Edit and Back to list', async () => {
    await renderDetail('RP-0001');
    const main = within(screen.getByRole('main'));

    expect(main.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/properties/RP-0001/edit',
    );
    expect(main.getByRole('link', { name: 'Back to list' })).toHaveAttribute(
      'href',
      '/properties',
    );
  });
});

describe('PropertyDetailPage: an unknown ID (FR-DET-03)', () => {
  it('shows "Property not found" with a link back to the list', async () => {
    renderRoutes(routes, { initialEntries: ['/properties/RP-9999'] });
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: TEXT.propertyNotFound }),
      ).toBeInTheDocument(),
    );

    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'Back to list',
      }),
    ).toHaveAttribute('href', '/properties');
  });

  it('AC-07 reads the same for a property that was just deleted', async () => {
    await propertyService.remove('RP-0005');

    renderRoutes(routes, { initialEntries: ['/properties/RP-0005'] });
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: TEXT.propertyNotFound }),
      ).toBeInTheDocument(),
    );
  });

  it('shows no field groups when there is no property', async () => {
    renderRoutes(routes, { initialEntries: ['/properties/RP-9999'] });
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: TEXT.propertyNotFound }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Location' }),
    ).not.toBeInTheDocument();
  });
});
