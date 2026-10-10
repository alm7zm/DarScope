import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ARABIC_DISTRICT, makePortfolio } from '../../test/fixtures.js';
import { renderRoutes } from '../../test/render.jsx';
import PropertyTable from './PropertyTable.jsx';

function renderTable(properties = makePortfolio()) {
  return renderRoutes([
    { path: '/', element: <PropertyTable properties={properties} /> },
  ]);
}

/** The cells of the row whose ID cell holds `id`. */
function rowCells(id) {
  const row = screen.getByRole('rowheader', { name: id }).closest('tr');
  return within(row).getAllByRole('cell');
}

describe('PropertyTable (FR-LST-02)', () => {
  it('has the nine columns of SRS 4.3, in order', () => {
    renderTable();

    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent);

    expect(headers).toEqual([
      'ID',
      'City',
      'District',
      'Type',
      'Size',
      'Bedrooms',
      'Yearly rent',
      'Status',
      'Actions',
    ]);
  });

  it('shows one row per property, plus the header row', () => {
    const properties = makePortfolio();
    renderTable(properties);

    expect(screen.getAllByRole('row')).toHaveLength(properties.length + 1);
  });

  it('has an accessible name, so the table is announced', () => {
    renderTable();
    expect(screen.getByRole('table')).toHaveAccessibleName(
      'Properties in the portfolio',
    );
  });

  it('puts each property ID in a row header', () => {
    renderTable();
    expect(
      screen.getByRole('rowheader', { name: 'RP-0001' }),
    ).toBeInTheDocument();
  });
});

describe('PropertyTable: how values are written (FR-LST-06)', () => {
  it('writes rent with thousands separators and SAR', () => {
    renderTable();
    expect(rowCells('RP-0001')[5]).toHaveTextContent('120,000 SAR');
  });

  it('writes size with m2', () => {
    renderTable();
    expect(rowCells('RP-0001')[3]).toHaveTextContent('450 m²');
  });

  it('shows city, district, type and bedrooms', () => {
    renderTable();
    const cells = rowCells('RP-0001');

    expect(cells[0]).toHaveTextContent('Riyadh');
    expect(cells[1]).toHaveTextContent('Al Malqa');
    expect(cells[2]).toHaveTextContent('Villa');
    expect(cells[4]).toHaveTextContent('4');
  });
});

describe('PropertyTable: status (FR-LST-08, NFR-ACC-05)', () => {
  it('shows the status as a word, so colour is never the only signal', () => {
    renderTable();

    expect(rowCells('RP-0001')[6]).toHaveTextContent('Vacant');
    expect(rowCells('RP-0002')[6]).toHaveTextContent('Occupied');
    expect(rowCells('RP-0003')[6]).toHaveTextContent('Under maintenance');
  });
});

describe('PropertyTable: Arabic text (FR-LST-07, NFR-ACC-07)', () => {
  it('lets the browser lay out an Arabic district, and marks its language', () => {
    renderTable();

    const districtCell = rowCells('RP-0002')[1];
    expect(districtCell).toHaveTextContent(ARABIC_DISTRICT);
    expect(districtCell).toHaveAttribute('dir', 'auto');
    expect(districtCell).toHaveAttribute('lang', 'ar');
  });

  it('marks an English district for automatic direction but not as Arabic', () => {
    renderTable();

    const districtCell = rowCells('RP-0001')[1];
    expect(districtCell).toHaveAttribute('dir', 'auto');
    expect(districtCell).not.toHaveAttribute('lang');
  });
});

describe('PropertyTable: row actions (FR-LST-03)', () => {
  it('offers View and Edit on every row', () => {
    const properties = makePortfolio();
    renderTable(properties);

    for (const property of properties) {
      expect(
        screen.getByRole('link', { name: `View ${property.id}` }),
      ).toHaveAttribute('href', `/properties/${property.id}`);
      expect(
        screen.getByRole('link', { name: `Edit ${property.id}` }),
      ).toHaveAttribute('href', `/properties/${property.id}/edit`);
    }
  });

  it('names each action with its property, so the links are told apart', () => {
    renderTable();
    // Nine rows of "View" would otherwise be nine identical link names.
    expect(
      screen.getByRole('link', { name: 'View RP-0003' }),
    ).toBeInTheDocument();
  });
});

describe('PropertyTable: nothing to show', () => {
  it('renders the header row only when given no properties', () => {
    renderTable([]);

    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getAllByRole('columnheader')).toHaveLength(9);
  });
});
