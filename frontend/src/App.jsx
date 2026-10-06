import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from './routes/routes.jsx';

const router = createBrowserRouter(routes);

/** The app root. Providers that every page needs, such as the portfolio state, wrap the router here. */
export default function App() {
  return <RouterProvider router={router} />;
}
