import Button from './Button.jsx';
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
 * Something is loading from the server. A spinner beside the words, announced politely to a screen
 * reader. The message stays one plain text node, so it reads the same to a test and to a person.
 * The spinner stops for anyone who asked for reduced motion: `global.css` does that for the app.
 *
 * @param {{ message: string }} props
 */
export function Loading({ message }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/**
 * The portfolio could not be loaded, shown in place of a page's content with the reason the data
 * service gave. An alert, so a screen reader announces it. When `onRetry` is given, a Try again
 * button asks the server once more, so a server that was only slow to wake does not need a reload
 * of the whole page.
 *
 * @param {{ reason: string, onRetry?: () => void }} props
 */
export function LoadError({ reason, onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.errorText}>
        The portfolio could not be loaded. {reason}
      </p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
