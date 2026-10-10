import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import { routes } from './routes.jsx';

function renderApp(url, table = routes) {
  // renderRoutes adds the portfolio state that the layout and the pages read, as App.jsx does.
  return renderRoutes(table, { initialEntries: [url] }).router;
}

function mainHeading(name) {
  return screen.getByRole('heading', { level: 1, name });
}

describe('routes', () => {
  it('AC-01 navigate', async () => {
    const user = userEvent.setup();
    const router = renderApp('/');

    for (const name of ['Properties', 'Add property', 'About', 'Dashboard']) {
      await user.click(screen.getByRole('link', { name }));

      expect(mainHeading(name)).toBeInTheDocument();
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }

    await act(() => router.navigate(-1));
    expect(mainHeading('About')).toBeInTheDocument();

    await act(() => router.navigate(-1));
    expect(mainHeading('Add property')).toBeInTheDocument();
  });

  it.each([
    ['/', 'Dashboard'],
    ['/properties', 'Properties'],
    ['/properties/new', 'Add property'],
    ['/properties/RP-0001', 'Property detail'],
    ['/properties/RP-0001/edit', 'Edit property'],
    ['/insights', 'Market insights'],
    ['/about', 'About'],
  ])(
    'opens %s as the page "%s", with one main heading and a tab title (FR-NAV-05, UI-02, FR-NAV-09)',
    (url, name) => {
      renderApp(url);

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(mainHeading(name)).toBeInTheDocument();
      expect(document.title).toBe(`${name} · Darscope`);
    },
  );

  it('shows "Page not found" with a link to the Dashboard for an unknown URL (FR-NAV-07)', () => {
    renderApp('/no/such/page');

    expect(mainHeading('Page not found')).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: /dashboard/i,
      }),
    ).toHaveAttribute('href', '/');
  });

  it('shows an error screen with a Reload button when a page throws, and keeps the menu (FR-FBK-03)', () => {
    // React reports the thrown error on the console; keep the test output clean.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    function BrokenPage() {
      throw new Error('boom');
    }
    const [layout] = routes;
    const [pages] = layout.children;
    const table = [
      {
        ...layout,
        children: [
          {
            ...pages,
            children: [
              { path: '/broken', element: <BrokenPage /> },
              ...pages.children,
            ],
          },
        ],
      },
    ];

    renderApp('/broken', table);

    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
