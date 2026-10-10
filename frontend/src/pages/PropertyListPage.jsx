import { Link } from 'react-router';
import PropertyTable from '../components/properties/PropertyTable.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { PATHS } from '../routes/paths.js';
import styles from './PropertyListPage.module.css';

/** Find and browse properties (SRS 4.3 and 6). */
export default function PropertyListPage() {
  const { properties, loading, loadError } = usePortfolio();

  return (
    <Page title="Properties">
      {loading ? <p>Loading properties…</p> : null}

      {loadError ? (
        <p className={styles.error} role="alert">
          The portfolio could not be loaded. {loadError}
        </p>
      ) : null}

      {!loading && !loadError ? (
        <>
          {/* FR-LST-04. X and Y differ once search and filters narrow the list. */}
          <p className={styles.count}>
            Showing {properties.length} of {properties.length} properties
          </p>

          {properties.length === 0 ? (
            <EmptyPortfolio />
          ) : (
            <PropertyTable properties={properties} />
          )}
        </>
      ) : null}
    </Page>
  );
}

/** What the page shows when the portfolio holds nothing at all (FR-LST-05). */
function EmptyPortfolio() {
  return (
    <div className={styles.empty}>
      <p>{TEXT.emptyPortfolio}</p>
      <Link to={PATHS.addProperty} className={styles.emptyAction}>
        Add property
      </Link>
    </div>
  );
}
