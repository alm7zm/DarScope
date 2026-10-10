import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FIELD_ERRORS,
  SEARCH_DEBOUNCE_MS,
  TEXT,
} from '../../constants/messages.js';
import * as propertyService from '../../services/propertyService.js';
import { renderRoutes } from '../../test/render.jsx';
import { routes } from '../../routes/routes.jsx';

beforeEach(() => {
  propertyService.__resetForTests();
});

/** Open the list and wait for the portfolio. */
async function openList() {
  const user = userEvent.setup();
  const result = renderRoutes(routes, { initialEntries: ['/properties'] });
  await waitFor(() =>
    expect(screen.queryByText('Loading properties…')).not.toBeInTheDocument(),
  );
  return { user, ...result };
}

/** The IDs of the rows currently shown. */
function shownIds() {
  return screen
    .queryAllByRole('rowheader')
    .map((cell) => cell.textContent)
    .sort();
}

/** The search panel, so its "Clear all" is told apart from the empty state's. */
function panel() {
  return within(screen.getByRole('search'));
}

describe('The search box (FR-SRC-01, FR-SRC-02)', () => {
  it('sits above the list, with a label', async () => {
    await openList();
    expect(
      screen.getByRole('searchbox', { name: /Search properties/ }),
    ).toBeInTheDocument();
  });

  it('AC-09 narrows the list to what matches, and counts against the whole portfolio', async () => {
    const all = await propertyService.list();
    const jeddah = all.filter((property) => property.city === 'Jeddah');
    const { user } = await openList();

    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      'jeddah',
    );

    await waitFor(() =>
      expect(shownIds()).toEqual(jeddah.map((p) => p.id).sort()),
    );
    // Y is the portfolio total, X the number matching (FR-LST-04).
    expect(
      screen.getByText(`Showing ${jeddah.length} of ${all.length} properties`),
    ).toBeInTheDocument();
  });

  it('finds one property by its ID', async () => {
    const { user } = await openList();

    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      'rp-0003',
    );

    await waitFor(() => expect(shownIds()).toEqual(['RP-0003']));
  });

  it('AC-10 finds a property by its Arabic district', async () => {
    // The district is taken from the seed rather than written here, so the test keeps working
    // when prepare-data replaces the seed with the real 40 properties.
    const all = await propertyService.list();
    const withArabic = all.find((property) => /[؀-ۿ]/.test(property.district));
    expect(withArabic).toBeDefined();

    const expected = all
      .filter((property) => property.district === withArabic.district)
      .map((property) => property.id)
      .sort();

    const { user } = await openList();
    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      withArabic.district,
    );

    await waitFor(() => expect(shownIds()).toEqual(expected));
  });
});

describe('The 300 ms pause (FR-SRC-03)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for the typing to stop, then searches', async () => {
    vi.useFakeTimers();
    renderRoutes(routes, { initialEntries: ['/properties'] });
    await act(async () => {});

    const all = await propertyService.list();
    const box = screen.getByRole('searchbox', { name: /Search properties/ });

    await act(async () => {
      fireEvent.change(box, { target: { value: 'jeddah' } });
    });

    // Nothing has happened yet, just before the pause is up.
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(shownIds()).toHaveLength(all.length);

    // And now it has.
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(shownIds().length).toBeLessThan(all.length);
  });

  it('searches at once on Enter, without waiting', async () => {
    vi.useFakeTimers();
    renderRoutes(routes, { initialEntries: ['/properties'] });
    await act(async () => {});

    const all = await propertyService.list();
    const box = screen.getByRole('searchbox', { name: /Search properties/ });

    await act(async () => {
      fireEvent.change(box, { target: { value: 'jeddah' } });
      fireEvent.submit(box.closest('form'));
    });

    // No timer was advanced.
    expect(shownIds().length).toBeLessThan(all.length);
  });
});

describe('The filters (FR-SRC-04, FR-SRC-05)', () => {
  it('offers every filter SRS 6 names', async () => {
    await openList();
    const search = panel();

    expect(search.getByRole('group', { name: 'City' })).toBeInTheDocument();
    expect(search.getByRole('group', { name: 'Status' })).toBeInTheDocument();
    expect(search.getByLabelText('Type')).toBeInTheDocument();
    expect(search.getByLabelText('Bedrooms, at least')).toBeInTheDocument();
    expect(
      search.getByRole('group', { name: 'Yearly rent (SAR)' }),
    ).toBeInTheDocument();
    expect(
      search.getByRole('group', { name: 'Size (m²)' }),
    ).toBeInTheDocument();
  });

  it('filters by one city, then by two at once', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    await user.click(panel().getByRole('checkbox', { name: 'Riyadh' }));
    await waitFor(() =>
      expect(shownIds()).toEqual(
        all
          .filter((p) => p.city === 'Riyadh')
          .map((p) => p.id)
          .sort(),
      ),
    );

    await user.click(panel().getByRole('checkbox', { name: 'Jeddah' }));
    expect(shownIds()).toEqual(
      all
        .filter((p) => p.city === 'Riyadh' || p.city === 'Jeddah')
        .map((p) => p.id)
        .sort(),
    );
  });

  it('filters by status', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    await user.click(panel().getByRole('checkbox', { name: 'Vacant' }));

    await waitFor(() =>
      expect(shownIds()).toEqual(
        all
          .filter((p) => p.status === 'Vacant')
          .map((p) => p.id)
          .sort(),
      ),
    );
  });

  it('filters by type', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    await user.selectOptions(panel().getByLabelText('Type'), 'Duplex');

    await waitFor(() =>
      expect(shownIds()).toEqual(
        all
          .filter((p) => p.propertyType === 'Duplex')
          .map((p) => p.id)
          .sort(),
      ),
    );
  });

  it('AC-11 combines city, status and minimum bedrooms, and Clear all restores everything', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    await user.click(panel().getByRole('checkbox', { name: 'Riyadh' }));
    await user.click(panel().getByRole('checkbox', { name: 'Vacant' }));
    await user.selectOptions(panel().getByLabelText('Bedrooms, at least'), '4');

    const expected = all
      .filter(
        (p) => p.city === 'Riyadh' && p.status === 'Vacant' && p.bedrooms >= 4,
      )
      .map((p) => p.id)
      .sort();

    await waitFor(() => expect(shownIds()).toEqual(expected));

    // FR-SRC-06: everything comes back.
    await user.click(panel().getByRole('button', { name: 'Clear all' }));

    await waitFor(() => expect(shownIds()).toHaveLength(all.length));
    expect(panel().getByRole('checkbox', { name: 'Riyadh' })).not.toBeChecked();
    expect(panel().getByLabelText('Bedrooms, at least')).toHaveValue('');
  });

  it('applies the search box and the filters together', async () => {
    const { user } = await openList();

    await user.click(panel().getByRole('checkbox', { name: 'Riyadh' }));
    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      'duplex',
    );

    await waitFor(() => {
      for (const id of shownIds()) {
        expect(id).toBeTruthy();
      }
    });
    // Everything shown is a Riyadh duplex.
    const all = await propertyService.list();
    const expected = all
      .filter((p) => p.city === 'Riyadh' && p.propertyType === 'Duplex')
      .map((p) => p.id)
      .sort();
    await waitFor(() => expect(shownIds()).toEqual(expected));
  });

  it('FR-SRC-06 Clear all also empties the search box', async () => {
    const { user } = await openList();
    const box = screen.getByRole('searchbox', { name: /Search properties/ });

    await user.type(box, 'jeddah');
    expect(box).toHaveValue('jeddah');

    await user.click(panel().getByRole('button', { name: 'Clear all' }));

    expect(box).toHaveValue('');
  });
});

describe('AC-13 a range the wrong way round (FR-SRC-07)', () => {
  it('explains the problem and leaves the list alone', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    const rent = within(
      panel().getByRole('group', { name: 'Yearly rent (SAR)' }),
    );
    await user.type(rent.getByLabelText('From'), '200000');
    await user.type(rent.getByLabelText('To'), '100000');

    expect(screen.getByText(FIELD_ERRORS.rentFilterOrder)).toBeInTheDocument();
    // The range is not applied, so nothing was filtered out.
    expect(shownIds()).toHaveLength(all.length);
  });

  it('explains a backwards size range too', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    const size = within(panel().getByRole('group', { name: 'Size (m²)' }));
    await user.type(size.getByLabelText('From'), '600');
    await user.type(size.getByLabelText('To'), '300');

    expect(screen.getByText(FIELD_ERRORS.sizeFilterOrder)).toBeInTheDocument();
    expect(shownIds()).toHaveLength(all.length);
  });

  it('applies the range once it is the right way round', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    const rent = within(
      panel().getByRole('group', { name: 'Yearly rent (SAR)' }),
    );
    await user.type(rent.getByLabelText('From'), '100000');
    await user.type(rent.getByLabelText('To'), '200000');

    expect(
      screen.queryByText(FIELD_ERRORS.rentFilterOrder),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(shownIds()).toEqual(
        all
          .filter((p) => p.yearlyRentSar >= 100000 && p.yearlyRentSar <= 200000)
          .map((p) => p.id)
          .sort(),
      ),
    );
  });
});

describe('AC-12 a search with no matches (FR-LST-05)', () => {
  it('says so, and offers a Clear all that brings the list back', async () => {
    const all = await propertyService.list();
    const { user } = await openList();

    await user.type(
      screen.getByRole('searchbox', { name: /Search properties/ }),
      'zzzz',
    );

    await waitFor(() =>
      expect(screen.getByText(TEXT.noSearchMatches)).toBeInTheDocument(),
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.getByText(`Showing 0 of ${all.length} properties`),
    ).toBeInTheDocument();

    // The message is not the empty-portfolio one: the portfolio is not empty.
    expect(screen.queryByText(TEXT.emptyPortfolio)).not.toBeInTheDocument();

    // Clearing from beside the message restores the list.
    const buttons = screen.getAllByRole('button', { name: 'Clear all' });
    await user.click(buttons.at(-1));

    await waitFor(() => expect(shownIds()).toHaveLength(all.length));
  });
});
