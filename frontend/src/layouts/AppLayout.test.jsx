import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import AppLayout from './AppLayout.jsx';

// The layout reads the confirmation message from the portfolio state, so it renders inside the
// provider here exactly as it does in App.jsx.
function renderLayout(url = '/') {
  renderRoutes(
    [
      {
        element: <AppLayout />,
        children: [{ path: '*', element: <p>Page content</p> }],
      },
    ],
    { initialEntries: [url] },
  );
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

  it('offers a skip link that jumps past the menu to the content (WCAG 2.4.1)', () => {
    renderLayout();

    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveAttribute('href', '#main');
    // The target exists and can take focus.
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('is the first thing a keyboard reaches, before the menu', () => {
    renderLayout();

    const focusable = [
      ...document.querySelectorAll('a[href], button, input, select, textarea'),
    ];
    expect(focusable[0]).toHaveAccessibleName('Skip to content');
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
