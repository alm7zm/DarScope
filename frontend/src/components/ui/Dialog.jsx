import { useEffect, useRef } from 'react';
import Button from './Button.jsx';
import styles from './Dialog.module.css';

/**
 * A confirmation dialog built on the browser's own `<dialog>` element, which keeps focus inside
 * while open, closes on Esc and returns focus to the control that opened it (NFR-ACC-06). Cancel
 * is focused first, so Enter never destroys anything by accident (FR-DEL-02).
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   confirmLabel: string,
 *   confirmVariant?: 'primary' | 'danger',
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function Dialog({
  open,
  title,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  children,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Move focus off the destructive action, whatever order the markup happens to be in.
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="dialog-title"
      // Esc and the backdrop both raise `cancel`; treating it as Cancel keeps React's `open` and
      // the element's own state from drifting apart (FR-DEL-02).
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 className={styles.title} id="dialog-title">
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      <div className={styles.actions}>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
