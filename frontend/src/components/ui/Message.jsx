import styles from './Message.module.css';

/**
 * The confirmation strip shown after an add, update, delete or reset (FR-FBK-01). It sits in a
 * live region so a screen reader announces it without the user having to find it (FR-FBK-02),
 * and it can be dismissed before its timer runs out. The timer itself lives in the portfolio
 * context, which owns the message.
 *
 * The live region is always rendered, even when there is no message: a region added to the page
 * at the same moment as its text is often not announced at all.
 *
 * @param {{ text: string | null, onDismiss: () => void }} props
 */
export default function Message({ text, onDismiss }) {
  return (
    <div aria-live="polite" aria-atomic="true" className={styles.region}>
      {text ? (
        <div className={styles.message}>
          <p className={styles.text}>{text}</p>
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Dismiss message"
          >
            &times;
          </button>
        </div>
      ) : null}
    </div>
  );
}
