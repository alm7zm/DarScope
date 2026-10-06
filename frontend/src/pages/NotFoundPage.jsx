import { Link } from 'react-router';
import Page from '../components/ui/Page.jsx';
import { PATHS } from '../routes/paths.js';

/** Shown for any URL the app does not know (FR-NAV-07). */
export default function NotFoundPage() {
  return (
    <Page title="Page not found">
      <p>There is no page at this address.</p>
      <p>
        <Link to={PATHS.dashboard}>Go to the Dashboard</Link>
      </p>
    </Page>
  );
}
