import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import AppLayout from './AppLayout.jsx';

function renderLayout(url = '/') {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [{ path: '*', element: <p>Page content</p> }],
      },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
}

describe('AppLayout', () => {
  it('frames the page with header, navigation, main and footer landmarks (UI-01, NFR-ACC-04)', () => {
    renderLayout();

    expect(
      within(screen.getByRole('banner')).getByText('Darscope'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('banner')).getByRole('navigation', {
        name: 'Main',
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByText('Page content'),
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows the menu items Dashboard, Properties, Add property and About (FR-NAV-01)', () => {
    renderLayout();

    const menu = screen.getByRole('navigation', { name: 'Main' });
    const labels = within(menu)
      .getAllByRole('link')
      .map((link) => link.textContent);

    expect(labels).toEqual([
      'Dashboard',
      'Properties',
      'Add property',
      'About',
    ]);
  });

  it('marks only the current page in the menu (FR-NAV-04)', () => {
    renderLayout('/properties/new');

    expect(screen.getByRole('link', { name: 'Add property' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'Properties' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('states the course, the data credit and the reload notice in the footer (UI-01, FR-DAT-06)', () => {
    renderLayout();

    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveTextContent('SE411');
    expect(footer).toHaveTextContent('Saudi Arabia Real Estate (AQAR)');
    expect(footer).toHaveTextContent(
      /changes are kept only until the page reloads/i,
    );
  });
});
