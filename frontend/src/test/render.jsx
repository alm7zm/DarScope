import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import PortfolioProvider from '../context/PortfolioProvider.jsx';

/**
 * Render a route table the way the app does: the portfolio state around a router (App.jsx), but
 * with a memory router so a test can start at any URL and read the one it ends on.
 *
 * @param {Array<object>} routes A React Router route table.
 * @param {{ initialEntries?: string[] }} [options]
 * @returns {{ router: object } & import('@testing-library/react').RenderResult} The render result,
 *   plus the router, whose `state.location.pathname` is where the app currently is.
 */
export function renderRoutes(routes, { initialEntries = ['/'] } = {}) {
  const router = createMemoryRouter(routes, { initialEntries });
  const result = render(
    <PortfolioProvider>
      <RouterProvider router={router} />
    </PortfolioProvider>,
  );
  return { ...result, router };
}

/**
 * Render one component inside the portfolio state, with no routing. For a component that needs
 * the portfolio but no URL.
 * @param {import('react').ReactNode} ui
 */
export function renderWithPortfolio(ui) {
  return render(<PortfolioProvider>{ui}</PortfolioProvider>);
}
