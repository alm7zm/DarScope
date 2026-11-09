import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pager from './Pager.jsx';

function renderPager(overrides = {}) {
  const props = {
    page: 2,
    pageCount: 3,
    from: 11,
    to: 20,
    total: 27,
    perPage: 10,
    onPageChange: vi.fn(),
    onPerPageChange: vi.fn(),
    ...overrides,
  };
  render(<Pager {...props} />);
  return props;
}

describe('Pager (FR-LST-10)', () => {
  it('says which page is shown and which rows it holds', () => {
    renderPager();

    expect(
      screen.getByRole('navigation', { name: 'Pages' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('(11 to 20 of 27)')).toBeInTheDocument();
  });

  it('asks for the page before and after', async () => {
    const user = userEvent.setup();
    const props = renderPager();

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(props.onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it('cannot go before the first page or past the last', () => {
    renderPager({ page: 1, pageCount: 1, from: 1, to: 4, total: 4 });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('offers 5, 10, 25 or 50 a page', async () => {
    const user = userEvent.setup();
    const props = renderPager();

    const perPage = screen.getByLabelText('Per page');
    expect(Array.from(perPage.options).map((option) => option.value)).toEqual([
      '5',
      '10',
      '25',
      '50',
    ]);
    expect(perPage).toHaveValue('10');

    await user.selectOptions(perPage, '5');

    expect(props.onPerPageChange).toHaveBeenCalledWith(5);
  });
});
