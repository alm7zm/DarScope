import Badge from '../ui/Badge.jsx';
import { formatCount, formatRent } from '../../utils/format.js';
import styles from './SummaryCards.module.css';

/**
 * The headline figures of the portfolio (FR-DSH-01, FR-DSH-02). Nothing here is stored: the
 * figures come from `utils/stats.js` on every render, so they follow an add, update, delete or
 * reset in the same pass (FR-DSH-03).
 *
 * @param {{ summary: import('../../utils/stats.js').PortfolioSummary }} props
 */
export default function SummaryCards({ summary }) {
  return (
    <>
      <section aria-labelledby="summary-heading">
        <h2 className={styles.sectionTitle} id="summary-heading">
          Portfolio
        </h2>
        <dl className={styles.grid}>
          <Figure label="Total properties" value={formatCount(summary.total)} />
          <Figure
            label="Occupancy rate"
            // An empty portfolio has nothing to divide by, so it reads as a dash rather than
            // as 0% (FR-DSH-02).
            value={
              summary.occupancyRate === null ? '—' : `${summary.occupancyRate}%`
            }
          />
          <Figure
            label="Rent from occupied"
            value={formatRent(summary.rentFromOccupied)}
          />
          <Figure
            label="Potential rent"
            value={formatRent(summary.potentialRent)}
            hint="If every property were let"
          />
        </dl>
      </section>

      <section aria-labelledby="status-heading">
        <h2 className={styles.sectionTitle} id="status-heading">
          By status
        </h2>
        <dl className={styles.grid}>
          <Figure
            label="Occupied"
            value={formatCount(summary.occupied)}
            badge="Occupied"
          />
          <Figure
            label="Vacant"
            value={formatCount(summary.vacant)}
            badge="Vacant"
          />
          <Figure
            label="Under maintenance"
            value={formatCount(summary.maintenance)}
            badge="Under maintenance"
          />
        </dl>
      </section>
    </>
  );
}

/**
 * One figure in a card. The label comes before the value in the markup, so a screen reader reads
 * "Total properties, 8" rather than a number with no context.
 *
 * When `badge` is set, the badge carries the label text itself, so there is nothing to repeat.
 * @param {{ label: string, value: string, hint?: string, badge?: string }} props
 */
function Figure({ label, value, hint, badge }) {
  return (
    <div className={styles.card}>
      <dt className={styles.label}>
        {badge ? <Badge status={badge} /> : label}
      </dt>
      <dd className={styles.value}>{value}</dd>
      {hint ? <dd className={styles.hint}>{hint}</dd> : null}
    </div>
  );
}
