import AppLayout from '../layouts/AppLayout.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';
import MarketInsightsPage from '../pages/MarketInsightsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PropertyDetailPage from '../pages/PropertyDetailPage.jsx';
import PropertyFormPage from '../pages/PropertyFormPage.jsx';
import PropertyListPage from '../pages/PropertyListPage.jsx';
import { PATHS } from './paths.js';

/** The one table that maps each URL to its page (FR-NAV-05). Every page renders inside AppLayout. */
export const routes = [
  {
    element: <AppLayout />,
    children: [
      {
        // A page that throws shows the error screen inside the layout, so the menu stays usable (FR-FBK-03).
        // ponytail: page-level boundary only. Add an errorElement to the layout route if the layout
        // or the providers around it ever hold logic that can throw.
        errorElement: <ErrorPage />,
        children: [
          { path: PATHS.dashboard, element: <DashboardPage /> },
          { path: PATHS.properties, element: <PropertyListPage /> },
          { path: PATHS.addProperty, element: <PropertyFormPage /> },
          { path: PATHS.propertyDetail, element: <PropertyDetailPage /> },
          { path: PATHS.editProperty, element: <PropertyFormPage /> },
          { path: PATHS.insights, element: <MarketInsightsPage /> },
          { path: PATHS.about, element: <AboutPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
