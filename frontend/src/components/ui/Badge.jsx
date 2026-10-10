import styles from './Badge.module.css';

/** Which colour pair each status uses. The word itself is always shown (FR-LST-08). */
const VARIANT_BY_STATUS = {
  Vacant: 'vacant',
  Occupied: 'occupied',
  'Under maintenance': 'maintenance',
};

/**
 * A property's status as a word with a coloured badge. The status is never shown by colour alone,
 * so the badge reads correctly in greyscale and to a screen reader (FR-LST-08, NFR-ACC-05).
 * @param {{ status: string }} props
 */
export default function Badge({ status }) {
  const variant = VARIANT_BY_STATUS[status] ?? 'unknown';
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {/* Decoration only; the word beside it is what conveys the status. */}
      <span className={styles.dot} aria-hidden="true" />
      {status}
    </span>
  );
}
