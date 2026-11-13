import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_FILTERS } from '../../utils/search.js';
import FilterChips from './FilterChips.jsx';

describe('FilterChips (FR-SRC-13)', () => {
  it('shows nothing when no filter is set', () => {
    const { container } = render(
      <FilterChips filters={EMPTY_FILTERS} onRemove={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows one removable chip per filter that is set', () => {
    render(
      <FilterChips
        filters={{
          ...EMPTY_FILTERS,
          cities: ['Riyadh', 'Jeddah'],
          statuses: ['Vacant'],
          minBedrooms: '3',
          amenities: ['pool'],
        }}
        onRemove={vi.fn()}
      />,
    );

    const chips = screen.getByRole('list', { name: 'Active filters' });
    expect(chips.querySelectorAll('li')).toHaveLength(5);
    for (const name of [
      'Remove filter: Riyadh',
      'Remove filter: Jeddah',
      'Remove filter: Vacant',
      'Remove filter: Bedrooms: 3+',
      'Remove filter: Pool',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('hands the chip to onRemove when it is pressed', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterChips
        filters={{ ...EMPTY_FILTERS, cities: ['Riyadh'], minBedrooms: '3' }}
        onRemove={onRemove}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove filter: Riyadh' }),
    );
    expect(onRemove).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'cities', value: 'Riyadh' }),
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove filter: Bedrooms: 3+' }),
    );
    expect(onRemove).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'minBedrooms', value: null }),
    );
  });
});
