import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { STATUSES } from '../../constants/options.js';
import Badge from './Badge.jsx';

describe('Badge (FR-LST-08, NFR-ACC-05)', () => {
  it.each(STATUSES)('shows %s as a word, not only a colour', (status) => {
    render(<Badge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it('gives each status its own colour class', () => {
    const { container: vacant } = render(<Badge status="Vacant" />);
    const { container: occupied } = render(<Badge status="Occupied" />);

    expect(vacant.firstChild.className).not.toBe(occupied.firstChild.className);
  });

  it('still shows the text for a status outside the three choices', () => {
    render(<Badge status="Sold" />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });
});
