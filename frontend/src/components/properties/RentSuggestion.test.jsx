import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEXT } from '../../constants/messages.js';
import { loadRentModel } from '../../services/rentModelService.js';
import RentSuggestion from './RentSuggestion.jsx';

// The real model is checked in utils/rentModel.test.js and PropertyFormPage.test.jsx. Here the
// loader is a stand-in, so that every state, failure included, can be tested.
vi.mock('../../services/rentModelService.js', () => ({
  loadRentModel: vi.fn(),
}));

/** A model that suggests 100,000 SAR for any house it knows, and 10% more per amenity. */
const MODEL = {
  sizeRange: { min: 100, max: 1000 },
  base: Math.log(100000),
  city: {},
  front: {},
  type: {},
  district: { 'Riyadh|الملقا': 0 },
  districtUnknown: 0,
  numbers: { amenity_count: Math.log(1.1) },
};

const VALUES = {
  city: 'Riyadh',
  district: 'Al Malqa', // the English name the dropdown saves for الملقا
  front: 'North',
  propertyType: 'Villa',
  sizeSqm: '400',
  propertyAgeYears: '3',
  bedrooms: '5',
  bathrooms: '4',
  livingRooms: '2',
  amenities: {},
  description: '',
  yearlyRentSar: '',
};

function renderSuggestion(values = VALUES) {
  const user = userEvent.setup();
  const onUse = vi.fn();
  const { rerender } = render(<RentSuggestion values={values} onUse={onUse} />);
  const show = (next) =>
    rerender(<RentSuggestion values={next} onUse={onUse} />);
  return { user, onUse, show };
}

beforeEach(() => {
  vi.mocked(loadRentModel).mockReset();
  vi.mocked(loadRentModel).mockResolvedValue(MODEL);
});

describe('RentSuggestion (FR-ADD-13)', () => {
  it('shows the suggestion with the 2021 note, and "Use this rent" hands it to the form', async () => {
    const { user, onUse } = renderSuggestion();

    const panel = await screen.findByRole('group', { name: 'Suggested rent' });
    expect(within(panel).getByText('100,000 SAR')).toBeInTheDocument();
    expect(screen.getByText(TEXT.estimateDisclaimer)).toBeInTheDocument();
    expect(
      screen.queryByText(TEXT.rentSuggestionUnknownDistrict),
    ).not.toBeInTheDocument();

    // The button says which rent it would use.
    const use = screen.getByRole('button', { name: 'Use this rent' });
    expect(use).toHaveAccessibleDescription('100,000 SAR');
    await user.click(use);
    expect(onUse).toHaveBeenCalledWith(100000);
  });

  it('follows the values as they change: the number grows as amenities are added', async () => {
    const { show } = renderSuggestion();
    expect(await screen.findByText('100,000 SAR')).toBeInTheDocument();

    show({ ...VALUES, amenities: { pool: true } });

    expect(screen.getByText('110,000 SAR')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Use this rent' }),
    ).toHaveAccessibleDescription('110,000 SAR');
  });

  it('says when the district is not in the 2021 data', async () => {
    renderSuggestion({ ...VALUES, district: 'Al Ghadir' });

    expect(
      await screen.findByText(TEXT.rentSuggestionUnknownDistrict),
    ).toBeInTheDocument();
  });

  it('asks for the fields it needs, and offers no rent to use until then', async () => {
    renderSuggestion({ ...VALUES, sizeSqm: '' });

    expect(
      await screen.findByText(TEXT.rentSuggestionNeedsFields),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use this rent' }),
    ).not.toBeInTheDocument();
  });

  it('suggests nothing for a size the model never learned from', async () => {
    renderSuggestion({ ...VALUES, sizeSqm: '5000' });

    expect(
      await screen.findByText(TEXT.rentSuggestionOutsideData),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use this rent' }),
    ).not.toBeInTheDocument();
  });

  it('warns when the entered rent looks mistyped (FR-RNT-07)', async () => {
    const { show } = renderSuggestion({ ...VALUES, yearlyRentSar: '1000000' });

    expect(
      await screen.findByText(TEXT.rentFarFromSuggestion),
    ).toBeInTheDocument();

    show({ ...VALUES, yearlyRentSar: '120000' });
    expect(
      screen.queryByText(TEXT.rentFarFromSuggestion),
    ).not.toBeInTheDocument();
  });

  it('fails safely when the model cannot be loaded (CLAUDE.md rule 7)', async () => {
    vi.mocked(loadRentModel).mockRejectedValue(new Error('offline'));
    renderSuggestion();

    expect(
      await screen.findByText(TEXT.rentSuggestionUnavailable),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use this rent' }),
    ).not.toBeInTheDocument();
  });
});
