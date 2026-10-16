import CityTable from '../components/dashboard/CityTable.jsx';
import NeedsAttentionList from '../components/dashboard/NeedsAttentionList.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import { ButtonLink } from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { EmptyState, LoadError } from '../components/ui/PageStates.jsx';
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
        <LoadError reason={loadError} />
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
        <ButtonLink to={PATHS.properties}>View all properties</ButtonLink>
      }
    >
      <SummaryCards summary={summary} />

      {/* FR-DSH-04: an empty portfolio still shows its zeros above, then asks for a first
          property rather than printing empty tables. */}
      {summary.total === 0 ? (
        <EmptyState message={TEXT.emptyPortfolio}>
          <ButtonLink variant="primary" to={PATHS.addProperty}>
            Add property
          </ButtonLink>
        </EmptyState>
      ) : (
        <div className={styles.panels}>
          <CityTable rows={byCity(properties)} />
          <NeedsAttentionList properties={needsAttention(properties)} />
        </div>
      )}
    </Page>
  );
}
