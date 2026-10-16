import styles from './PageStates.module.css';

/**
 * A page with nothing to show: a dashed box with the message and the one thing to do about it,
 * such as "Add property" (FR-LST-05, FR-DSH-04).
 *
 * @param {{ message: string, children?: import('react').ReactNode }} props
 */
export function EmptyState({ message, children }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>{message}</p>
      {children}
    </div>
  );
}

/**
 * The portfolio could not be loaded, shown in place of a page's content with the reason the data
 * service gave. An alert, so a screen reader announces it.
 *
 * @param {{ reason: string }} props
 */
export function LoadError({ reason }) {
  return (
    <p className={styles.error} role="alert">
      The portfolio could not be loaded. {reason}
    </p>
  );
}
