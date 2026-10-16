import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { DISTRICTS } from '../../constants/options.js';
import { hasArabic } from '../../utils/arabic.js';
import DistrictField from './DistrictField.jsx';

/** The field with its value held in state, as the form holds it. */
function Harness({ city, initial = '' }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DistrictField city={city} value={value} onChange={setValue} />
      <output aria-label="Stored district">{value}</output>
    </>
  );
}

/** A control by its whole label, without the "(required)" marker. */
function field(label) {
  return screen.getByLabelText(
    (name) => name.replace(/\s*\(required\)$/, '').trim() === label,
  );
}

function optionLabels() {
  return [...field('District').options].map((option) => option.textContent);
}

describe('DistrictField (FR-ADD-14)', () => {
  it('waits for a city before offering any district', () => {
    render(<Harness city="" />);

    expect(field('District')).toBeDisabled();
    expect(screen.getByText('Choose a city first')).toBeInTheDocument();
  });

  it('offers the chosen city’s districts in the 2021 data, then "Other district…"', () => {
    render(<Harness city="Dammam" />);

    expect(field('District')).toBeEnabled();
    expect(optionLabels()).toEqual([
      'Choose a district',
      ...DISTRICTS.Dammam,
      'Other district…',
    ]);
  });

  it('names every district in English, as the rest of the interface is', () => {
    for (const [city, names] of Object.entries(DISTRICTS)) {
      expect(names.filter(hasArabic), city).toEqual([]);
    }
  });

  it('stores the district chosen from the list, as the list spells it', async () => {
    const user = userEvent.setup();
    render(<Harness city="Riyadh" />);

    await user.selectOptions(field('District'), 'Al Malqa');

    expect(screen.getByLabelText('Stored district')).toHaveTextContent(
      'Al Malqa',
    );
  });

  it('opens a text box for a district the list lacks', async () => {
    const user = userEvent.setup();
    render(<Harness city="Riyadh" />);

    await user.selectOptions(field('District'), 'Other district…');
    await user.type(field('Other district'), 'Al Ghadir');

    expect(screen.getByLabelText('Stored district')).toHaveTextContent(
      'Al Ghadir',
    );
  });

  it('keeps a stored name the list lacks as a choice, so editing never loses it', () => {
    render(<Harness city="Riyadh" initial="النرجس" />);

    expect(field('District')).toHaveValue('النرجس');
  });

  it('marks a kept Arabic name as Arabic, so it reads right-to-left (NFR-ACC-07)', () => {
    render(<Harness city="Riyadh" initial="النرجس" />);

    expect(screen.getByRole('option', { name: 'النرجس' })).toHaveAttribute(
      'lang',
      'ar',
    );
    expect(
      screen.getByRole('option', { name: 'Al Narjis' }),
    ).not.toHaveAttribute('lang');
  });
});
