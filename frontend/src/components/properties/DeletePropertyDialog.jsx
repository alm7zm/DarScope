import { useState } from 'react';
import Dialog from '../ui/Dialog.jsx';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { displayTitle } from '../../utils/format.js';
import { textDirection } from '../../utils/arabic.js';
import styles from './DeletePropertyDialog.module.css';

/**
 * The one confirmation every delete goes through, from a list row and from the detail page
 * (FR-DEL-01, FR-DEL-02). It names the property by ID, type, district and city, so a mis-aimed
 * click is obvious before it is confirmed. The underlying `Dialog` gives Cancel first focus and
 * cancels on Esc.
 *
 * @param {{
 *   property: Record<string, unknown> | null,
 *   onCancel: () => void,
 *   onDeleted?: (property: Record<string, unknown>) => void,
 * }} props `property` is the one awaiting confirmation, or null when the dialog is closed.
 */
export default function DeletePropertyDialog({
  property,
  onCancel,
  onDeleted,
}) {
  const { deleteProperty } = usePortfolio();
  const [failure, setFailure] = useState(null);

  async function handleConfirm() {
    setFailure(null);
    try {
      const removed = await deleteProperty(property.id);
      // The confirmation message itself comes from the portfolio state (FR-DEL-04).
      onDeleted?.(removed);
    } catch (error) {
      setFailure(error?.message ?? 'The property could not be deleted.');
    }
  }

  return (
    <Dialog
      open={property !== null}
      title="Delete this property?"
      confirmLabel="Delete"
      confirmVariant="danger"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      {property ? (
        <>
          <p className={styles.name}>
            <strong>{property.id}</strong>
            {', '}
            <span {...textDirection(property.district)}>
              {displayTitle(property)}
            </span>
          </p>
          {/* Deliberately not "this cannot be undone": FR-DEL-07 adds Undo for 8 seconds in
              stage 2, which would make that sentence false. */}
          <p className={styles.warning}>
            The property is removed from the portfolio.
          </p>
          {failure ? (
            <p className={styles.failure} role="alert">
              {failure}
            </p>
          ) : null}
        </>
      ) : null}
    </Dialog>
  );
}
