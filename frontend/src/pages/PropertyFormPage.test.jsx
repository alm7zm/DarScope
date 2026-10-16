import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { FIELD_ERRORS, TEXT } from '../constants/messages.js';
import { AMENITIES } from '../constants/options.js';
import * as propertyService from '../services/propertyService.js';
import { renderRoutes } from '../test/render.jsx';
import { routes } from '../routes/routes.jsx';

beforeEach(() => {
  propertyService.__resetForTests();
});

/**
 * A field by its whole label. Matching only the start would make "Front" also match the
 * "Front yard" amenity, so the label is matched in full, with the optional "(required)" marker
 * allowed on the end.
 */
function field(label) {
  return screen.getByLabelText((name) => {
    const withoutMarker = name.replace(/\s*\(required\)$/, '').trim();
    return withoutMarker === label;
  });
}

async function renderForm(url) {
  const user = userEvent.setup();
  const result = renderRoutes(routes, { initialEntries: [url] });
  await waitFor(() =>
    expect(screen.queryByText('Loading property…')).not.toBeInTheDocument(),
  );
  return { user, ...result };
}

/** Fill in every required field with values that pass every check in Appendix C. */
async function fillValidForm(user, overrides = {}) {
  const values = {
    City: 'Riyadh',
    District: 'Al Malqa',
    Type: 'Villa',
    'Size (m²)': '400',
    'Age (years)': '3',
    Bedrooms: '5',
    Bathrooms: '4',
    'Living rooms': '2',
    'Yearly rent (SAR)': '120000',
    Status: 'Vacant',
    ...overrides,
  };

  for (const [label, value] of Object.entries(values)) {
    if (label === 'District') {
      await chooseDistrict(user, value);
      continue;
    }
    const control = field(label);
    if (control.tagName === 'SELECT') {
      await user.selectOptions(control, value);
    } else {
      await user.clear(control);
      if (value !== '') await user.type(control, value);
    }
  }
}

/**
 * Pick a district from the dropdown, as AC-02's "Al Malqa", or type it through "Other district…"
 * when the list lacks it (FR-ADD-14). An empty name leaves the dropdown unchosen.
 */
async function chooseDistrict(user, name) {
  const list = field('District');
  const inList = [...list.options].some((option) => option.value === name);
  if (name === '' || inList) {
    await user.selectOptions(list, name);
    return;
  }
  await user.selectOptions(list, 'Other district…');
  await user.type(field('Other district'), name);
}

describe('PropertyFormPage: the Add form (FR-ADD-01, FR-ADD-02)', () => {
  it('shows every editable field of SRS 3.1', async () => {
    await renderForm('/properties/new');

    for (const label of [
      'City',
      'District',
      'Front',
      'Type',
      'Size (m²)',
      'Age (years)',
      'Bedrooms',
      'Bathrooms',
      'Living rooms',
      'Yearly rent (SAR)',
      'Status',
      'Tenant name',
      'Lease start',
      'Lease end',
      'Description',
    ]) {
      expect(field(label)).toBeInTheDocument();
    }
  });

  it('offers a tick box for each of the 13 amenities (SRS 3.2)', async () => {
    await renderForm('/properties/new');

    const group = screen
      .getByRole('group', { name: 'Amenities' })
      .querySelectorAll('input[type="checkbox"]');
    expect(group).toHaveLength(AMENITIES.length);

    for (const amenity of AMENITIES) {
      expect(screen.getByLabelText(amenity.label)).not.toBeChecked();
    }
  });

  it('marks the required fields in words, not by colour (FR-ADD-02, NFR-ACC-05)', async () => {
    await renderForm('/properties/new');

    expect(field('City')).toHaveAccessibleName(/required/i);
    expect(field('District')).toHaveAccessibleName(/required/i);
    expect(field('Yearly rent (SAR)')).toHaveAccessibleName(/required/i);
    // Front and Description are optional.
    expect(field('Front')).not.toHaveAccessibleName(/required/i);
    expect(field('Description')).not.toHaveAccessibleName(/required/i);
  });

  it('starts with Type Villa, Status Vacant and no amenities (FR-ADD-09)', async () => {
    await renderForm('/properties/new');

    expect(field('Type')).toHaveValue('Villa');
    expect(field('Status')).toHaveValue('Vacant');
  });

  it('groups the fields as SRS 5.1 asks (UI-03)', async () => {
    await renderForm('/properties/new');

    for (const group of [
      'Location',
      'Building',
      'Amenities',
      'Rent and tenancy',
      'Description',
    ]) {
      expect(screen.getByRole('group', { name: group })).toBeInTheDocument();
    }
  });
});

describe('PropertyFormPage: AC-02 add a valid property', () => {
  it('saves it, opens its detail page and confirms it by ID', async () => {
    const before = await propertyService.list();
    const { user } = await renderForm('/properties/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // The new ID follows the highest issued so far (FR-ADD-04).
    const expectedId = `RP-${String(before.length + 1).padStart(4, '0')}`;

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /Villa in Al Malqa/ }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(`Property ${expectedId} added`),
    ).toBeInTheDocument();

    const after = await propertyService.list();
    expect(after).toHaveLength(before.length + 1);
  });

  it('sets both timestamps and stores the values that were typed (FR-ADD-04)', async () => {
    const before = await propertyService.list();
    const { user } = await renderForm('/properties/new');

    await fillValidForm(user, { District: 'Al Nakheel' });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(async () =>
      expect(await propertyService.list()).toHaveLength(before.length + 1),
    );

    const created = (await propertyService.list()).at(-1);
    expect(created.district).toBe('Al Nakheel');
    expect(created.sizeSqm).toBe(400);
    expect(created.createdAt).toBe(created.updatedAt);
  });

  it('shows the new property in the list at once (FR-ADD-06)', async () => {
    const before = await propertyService.list();
    const { user } = await renderForm('/properties/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText(/added$/)).toBeInTheDocument());

    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole(
        'link',
        { name: 'Properties' },
      ),
    );

    expect(
      screen.getByText(
        `Showing ${before.length + 1} of ${before.length + 1} properties`,
      ),
    ).toBeInTheDocument();
  });
});

describe('PropertyFormPage: AC-03 reject invalid input (FR-ADD-03)', () => {
  it('saves nothing, shows each error beside its field and keeps what was typed', async () => {
    const before = await propertyService.list();
    const { user } = await renderForm('/properties/new');

    // Everything correct except District empty, Size 5, and Occupied with no tenant name.
    await fillValidForm(user, {
      District: '',
      'Size (m²)': '5',
      Status: 'Occupied',
    });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Nothing was saved.
    expect(await propertyService.list()).toHaveLength(before.length);

    // One message per failing field, in the exact words of Appendix C.
    expect(screen.getByText(FIELD_ERRORS.districtRequired)).toBeInTheDocument();
    expect(screen.getByText(FIELD_ERRORS.sizeRange)).toBeInTheDocument();
    expect(
      screen.getByText(FIELD_ERRORS.tenantNameRequired),
    ).toBeInTheDocument();

    // Focus is on the first failing field on the page.
    expect(field('District')).toHaveFocus();

    // Everything else the user entered is still there.
    expect(field('City')).toHaveValue('Riyadh');
    expect(field('Bedrooms')).toHaveValue('5');
    expect(field('Yearly rent (SAR)')).toHaveValue('120000');
    expect(field('Size (m²)')).toHaveValue('5');
  });

  it('links each error to its field, so it is read with the field (NFR-ACC-03)', async () => {
    const { user } = await renderForm('/properties/new');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const city = field('City');
    expect(city).toHaveAttribute('aria-invalid', 'true');
    expect(city).toHaveAccessibleDescription(
      new RegExp(FIELD_ERRORS.cityRequired),
    );
  });

  it('takes an error away as soon as the field is corrected', async () => {
    const { user } = await renderForm('/properties/new');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText(FIELD_ERRORS.districtRequired)).toBeInTheDocument();

    // Choosing the city leaves the district's error alone: the district is still empty.
    await user.selectOptions(field('City'), 'Riyadh');
    expect(screen.getByText(FIELD_ERRORS.districtRequired)).toBeInTheDocument();

    await chooseDistrict(user, 'Al Malqa');
    expect(
      screen.queryByText(FIELD_ERRORS.districtRequired),
    ).not.toBeInTheDocument();
  });
});

describe('PropertyFormPage: tenancy fields (FR-ADD-07)', () => {
  it('leaves them unusable until the status is Occupied', async () => {
    const { user } = await renderForm('/properties/new');

    expect(field('Tenant name')).toBeDisabled();
    expect(field('Lease start')).toBeDisabled();
    expect(field('Lease end')).toBeDisabled();

    await user.selectOptions(field('Status'), 'Occupied');

    expect(field('Tenant name')).toBeEnabled();
    expect(field('Lease start')).toBeEnabled();
    expect(field('Lease end')).toBeEnabled();
  });

  it('makes the tenant name required once the status is Occupied', async () => {
    const { user } = await renderForm('/properties/new');

    expect(field('Tenant name')).not.toHaveAccessibleName(/required/i);
    await user.selectOptions(field('Status'), 'Occupied');
    expect(field('Tenant name')).toHaveAccessibleName(/required/i);
  });
});

describe('PropertyFormPage: AC-04 cancel an add (FR-ADD-08)', () => {
  it('returns to the list and saves nothing', async () => {
    const before = await propertyService.list();
    const { user, router } = await renderForm('/properties/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(router.state.location.pathname).toBe('/properties');
    expect(await propertyService.list()).toHaveLength(before.length);
    expect(
      screen.getByText(
        `Showing ${before.length} of ${before.length} properties`,
      ),
    ).toBeInTheDocument();
  });
});

describe('PropertyFormPage: the rent suggestion (FR-ADD-13)', () => {
  /** The amount the suggestion shows, such as "123,500 SAR". */
  function suggestedAmount() {
    const panel = screen.getByRole('group', { name: 'Suggested rent' });
    return within(panel).getByText(/ SAR$/).textContent;
  }

  it('follows the form as it is filled, and fills Yearly rent only when asked', async () => {
    const { user } = await renderForm('/properties/new');

    // Before the fields it needs are filled, it says which they are.
    expect(
      await screen.findByText(TEXT.rentSuggestionNeedsFields),
    ).toBeInTheDocument();

    await fillValidForm(user, {
      Front: 'North',
      'Age (years)': '0',
      Bathrooms: '5',
      'Yearly rent (SAR)': '',
    });
    const withoutAmenities = suggestedAmount();

    for (const amenity of [
      'Kitchen',
      'Garage',
      "Maid's room",
      'Air conditioning',
    ]) {
      await user.click(screen.getByLabelText(amenity));
    }
    await user.type(field('Description'), 'فيلا جديدة مع ملحق');

    // The made-up Riyadh villa of utils/rentModel.test.js: 123,468 SAR, to the nearest 500.
    expect(suggestedAmount()).toBe('123,500 SAR');
    expect(withoutAmenities).not.toBe('123,500 SAR');
    expect(screen.getByText(TEXT.estimateDisclaimer)).toBeInTheDocument();
    // It never changes the field by itself.
    expect(field('Yearly rent (SAR)')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Use this rent' }));
    expect(field('Yearly rent (SAR)')).toHaveValue('123500');
  });

  it('is on the Edit form too, and says when the district is not in the 2021 data', async () => {
    const { user } = await renderForm('/properties/RP-0001/edit');

    // RP-0001 is in Al Malqa, a district the dropdown lists, so the model knows it.
    expect(
      await screen.findByRole('button', { name: 'Use this rent' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(TEXT.rentSuggestionUnknownDistrict),
    ).not.toBeInTheDocument();

    // Al Ghadir is a Riyadh district the 2021 data does not have.
    await chooseDistrict(user, 'Al Ghadir');
    expect(
      screen.getByText(TEXT.rentSuggestionUnknownDistrict),
    ).toBeInTheDocument();
  });

  it('warns when the rent looks mistyped, but still lets it be saved (FR-RNT-07)', async () => {
    const { user } = await renderForm('/properties/new');

    // 1,200,000 instead of 120,000: an extra zero.
    await fillValidForm(user, {
      'Yearly rent (SAR)': '1200000',
    });
    expect(
      await screen.findByText(TEXT.rentFarFromSuggestion),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByText(/^Property RP-\d{4} added$/)).toBeInTheDocument(),
    );
  });
});

describe('PropertyFormPage: choices instead of typing (FR-ADD-14, FR-ADD-15)', () => {
  it('offers age and the room counts as dropdowns of whole numbers', async () => {
    await renderForm('/properties/new');

    for (const [label, last] of [
      ['Age (years)', '100'],
      ['Bedrooms', '20'],
      ['Bathrooms', '20'],
      ['Living rooms', '20'],
    ]) {
      const options = [...field(label).options].map((option) => option.value);
      // The first option is the blank "Choose", so nothing is picked for the user.
      expect(options.slice(0, 2)).toEqual(['', '0']);
      expect(options.at(-1)).toBe(last);
    }
  });

  it('lists the chosen city’s districts, and clears one the new city does not have', async () => {
    const { user } = await renderForm('/properties/new');

    expect(field('District')).toBeDisabled();

    await user.selectOptions(field('City'), 'Riyadh');
    await user.selectOptions(field('District'), 'Al Malqa');
    expect(field('District')).toHaveValue('Al Malqa');

    await user.selectOptions(field('City'), 'Jeddah');
    expect(field('District')).toHaveValue('');
  });
});

describe('PropertyFormPage: number fields (FR-ADD-12)', () => {
  it('turns Arabic digits into 0 to 9 and drops thousands separators as they are typed', async () => {
    const { user } = await renderForm('/properties/new');

    await user.type(field('Size (m²)'), '٤٠٠');
    await user.type(field('Yearly rent (SAR)'), '120,000');

    expect(field('Size (m²)')).toHaveValue('400');
    expect(field('Yearly rent (SAR)')).toHaveValue('120000');
  });

  it('takes nothing but digits and one decimal point', async () => {
    const { user } = await renderForm('/properties/new');

    // Letters and spaces are refused, and so is a second decimal point.
    await user.type(field('Size (m²)'), 'abc 12.5.3x');

    expect(field('Size (m²)')).toHaveValue('12.53');
  });

  it('keeps a decimal point, so the check reports it instead of changing the number', async () => {
    const { user } = await renderForm('/properties/new');

    await user.type(field('Size (m²)'), '400.5');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(field('Size (m²)')).toHaveValue('400.5');
    expect(screen.getByText(FIELD_ERRORS.sizeWholeNumber)).toBeInTheDocument();
  });

  it('takes no more digits than the largest allowed value has', async () => {
    const { user } = await renderForm('/properties/new');

    // Size goes up to 100,000 (6 digits), rent up to 10,000,000 (8 digits).
    await user.type(field('Size (m²)'), '1234567');
    await user.type(field('Yearly rent (SAR)'), '123456789');

    expect(field('Size (m²)')).toHaveValue('123456');
    expect(field('Yearly rent (SAR)')).toHaveValue('12345678');
  });
});

describe('PropertyFormPage: the Edit form (FR-UPD-01)', () => {
  it('opens filled with the stored values', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderForm('/properties/RP-0001/edit');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Edit property' }),
    ).toBeInTheDocument();
    expect(field('City')).toHaveValue(property.city);
    expect(field('District')).toHaveValue(property.district);
    expect(field('Yearly rent (SAR)')).toHaveValue(
      String(property.yearlyRentSar),
    );
    expect(field('Status')).toHaveValue(property.status);
  });

  it('ticks the amenities the property already has', async () => {
    const property = await propertyService.getById('RP-0001');
    await renderForm('/properties/RP-0001/edit');

    for (const amenity of AMENITIES) {
      const box = screen.getByLabelText(amenity.label);
      if (property.amenities[amenity.key]) {
        expect(box).toBeChecked();
      } else {
        expect(box).not.toBeChecked();
      }
    }
  });

  it('shows "Property not found" for an ID that does not exist (FR-DET-03)', async () => {
    renderRoutes(routes, { initialEntries: ['/properties/RP-9999/edit'] });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: TEXT.propertyNotFound }),
      ).toBeInTheDocument(),
    );
  });
});

describe('PropertyFormPage: AC-05 update a property', () => {
  it('stores the change, keeps the ID and created date, and moves Last updated on', async () => {
    const before = await propertyService.getById('RP-0001');
    const { user } = await renderForm('/properties/RP-0001/edit');

    await user.clear(field('Yearly rent (SAR)'));
    await user.type(field('Yearly rent (SAR)'), '95000');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Wait for the detail page itself, not for the confirmation: the message is set by the
    // reducer and can appear while the form is still on screen, a frame before the route
    // changes.
    await waitFor(() =>
      expect(screen.getByText('95,000 SAR')).toBeInTheDocument(),
    );
    expect(screen.getByText('Property RP-0001 updated')).toBeInTheDocument();

    const after = await propertyService.getById('RP-0001');
    expect(after.id).toBe(before.id);
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.yearlyRentSar).toBe(95000);
    expect(after.updatedAt).not.toBe(before.updatedAt);
  });

  it('discards the change on Cancel (FR-UPD-06)', async () => {
    const before = await propertyService.getById('RP-0001');
    const { user, router } = await renderForm('/properties/RP-0001/edit');

    await user.clear(field('Yearly rent (SAR)'));
    await user.type(field('Yearly rent (SAR)'), '95000');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(router.state.location.pathname).toBe('/properties/RP-0001');
    expect(await propertyService.getById('RP-0001')).toEqual(before);
  });

  it('applies the same checks as adding (FR-UPD-02)', async () => {
    const before = await propertyService.getById('RP-0001');
    const { user } = await renderForm('/properties/RP-0001/edit');

    await user.clear(field('Size (m²)'));
    await user.type(field('Size (m²)'), '5');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText(FIELD_ERRORS.sizeRange)).toBeInTheDocument();
    expect(await propertyService.getById('RP-0001')).toEqual(before);
  });
});

describe('PropertyFormPage: AC-06 the status leaves Occupied (FR-UPD-07)', () => {
  it('warns before saving, then clears the tenant and lease details', async () => {
    const occupied = (await propertyService.list()).find(
      (property) => property.status === 'Occupied',
    );
    const { user } = await renderForm(`/properties/${occupied.id}/edit`);

    expect(field('Tenant name')).toHaveValue(occupied.tenantName);
    // No warning while the property is still occupied.
    expect(
      screen.queryByText(TEXT.statusLeavesOccupied),
    ).not.toBeInTheDocument();

    await user.selectOptions(field('Status'), 'Vacant');

    // The warning appears before the save, as AC-06 requires.
    expect(screen.getByText(TEXT.statusLeavesOccupied)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        screen.getByText(`Property ${occupied.id} updated`),
      ).toBeInTheDocument(),
    );

    const after = await propertyService.getById(occupied.id);
    expect(after.status).toBe('Vacant');
    expect(after.tenantName).toBe('');
    expect(after.leaseStart).toBe('');
    expect(after.leaseEnd).toBe('');

    // The detail page no longer shows a tenant row (FR-DET-04).
    expect(screen.queryByText('Tenant')).not.toBeInTheDocument();
  });

  it('does not warn when the status was never Occupied', async () => {
    const vacant = (await propertyService.list()).find(
      (property) => property.status === 'Vacant',
    );
    const { user } = await renderForm(`/properties/${vacant.id}/edit`);

    await user.selectOptions(field('Status'), 'Under maintenance');

    expect(
      screen.queryByText(TEXT.statusLeavesOccupied),
    ).not.toBeInTheDocument();
  });
});
