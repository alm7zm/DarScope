import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import PortfolioProvider from './context/PortfolioProvider.jsx';
import { routes } from './routes/routes.jsx';

const router = createBrowserRouter(routes);

/** The app root. The portfolio state wraps the router, so every page reads the same collection. */
export default function App() {
  return (
    <PortfolioProvider>
      <RouterProvider router={router} />
    </PortfolioProvider>
  );
}
