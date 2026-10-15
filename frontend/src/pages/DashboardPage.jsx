import { Link } from 'react-router';
import CityTable from '../components/dashboard/CityTable.jsx';
import NeedsAttentionList from '../components/dashboard/NeedsAttentionList.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { PATHS } from '../routes/paths.js';
import { byCity, needsAttention, summarise } from '../utils/stats.js';
import styles from './DashboardPage.module.css';

/** The portfolio at a glance (SRS 4.2). */
export default function DashboardPage() {
  const { properties, loading, loadError } = usePortfolio();

  if (loading) {
    return (
      <Page title="Dashboard">
        <p>Loading the portfolio…</p>
      </Page>
    );
  }

  if (loadError) {
    return (
      <Page title="Dashboard">
        <p className={styles.error} role="alert">
          The portfolio could not be loaded. {loadError}
        </p>
      </Page>
    );
  }

  // Calculated on every render, never stored, so every figure follows an add, update, delete
  // or reset in the same pass (FR-DSH-03, SRS 3.5).
  const summary = summarise(properties);

  return (
    <Page
      title="Dashboard"
      description="The portfolio at a glance."
      actions={
        /* FR-DSH-07. */
        <Link to={PATHS.properties} className={styles.shortcut}>
          View all properties
        </Link>
      }
    >
      <SummaryCards summary={summary} />

      {/* FR-DSH-04: an empty portfolio still shows its zeros above, then asks for a first
          property rather than printing empty tables. */}
      {summary.total === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{TEXT.emptyPortfolio}</p>
          <Link to={PATHS.addProperty} className={styles.emptyAction}>
            Add property
          </Link>
        </div>
      ) : (
        <div className={styles.panels}>
          <CityTable rows={byCity(properties)} />
          <NeedsAttentionList properties={needsAttention(properties)} />
        </div>
      )}
    </Page>
  );
}
