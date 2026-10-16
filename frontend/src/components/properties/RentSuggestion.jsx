import { useEffect, useId, useState } from 'react';
import Button from '../ui/Button.jsx';
import { TEXT } from '../../constants/messages.js';
import { loadRentModel } from '../../services/rentModelService.js';
import { formatRent } from '../../utils/format.js';
import {
  canSuggestRent,
  isFarFromSuggestion,
  suggestedRent,
} from '../../utils/rentModel.js';
import { toWholeNumber } from '../../utils/validation.js';
import styles from './RentSuggestion.module.css';

/**
 * The rent model's suggestion, always shown beside Yearly rent on the Add and Edit forms
 * (FR-ADD-13). It follows the values as they are entered, so the number moves as amenities are
 * ticked. "Use this rent" copies it into the field; it never changes the field by itself. If the
 * model cannot load, it says so and the form works as before: an AI feature fails safely
 * (CLAUDE.md rule 7, NFR-REL-02).
 *
 * It is not a live region on purpose: the number changes with every keystroke, and announcing
 * each change would drown out the form.
 *
 * @param {{ values: Record<string, any>, onUse: (rent: number) => void }} props
 */
export default function RentSuggestion({ values, onUse }) {
  const [model, setModel] = useState(null);
  const [failed, setFailed] = useState(false);
  const labelId = useId();
  const amountId = useId();

  useEffect(() => {
    let current = true;
    loadRentModel().then(
      (loaded) => current && setModel(loaded),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, []);

  if (!model && !failed) return null; // loading: it takes a moment, once

  const suggestion =
    model && canSuggestRent(values) ? suggestedRent(model, values) : null;
  const enteredRent = toWholeNumber(values.yearlyRentSar);

  return (
    <div className={styles.suggestion} role="group" aria-labelledby={labelId}>
      <p id={labelId} className={styles.label}>
        Suggested rent
      </p>
      <div
        className={
          suggestion ? styles.panel : `${styles.panel} ${styles.waiting}`
        }
      >
        {suggestion ? (
          <>
            <div className={styles.figure}>
              {/* A new amount is a new element, so its entrance plays again and the change
                  is seen. */}
              <p key={suggestion.rent} id={amountId} className={styles.amount}>
                {formatRent(suggestion.rent)}
              </p>
              <Button
                size="small"
                aria-describedby={amountId}
                onClick={() => onUse(suggestion.rent)}
              >
                Use this rent
              </Button>
            </div>
            {enteredRent !== null &&
            isFarFromSuggestion(enteredRent, suggestion.rent) ? (
              <p className={styles.warning}>{TEXT.rentFarFromSuggestion}</p>
            ) : null}
            <div className={styles.notes}>
              {suggestion.knownDistrict ? null : (
                <p>{TEXT.rentSuggestionUnknownDistrict}</p>
              )}
              <p>{TEXT.estimateDisclaimer}</p>
            </div>
          </>
        ) : (
          <p className={styles.none}>{whyNone(failed, values)}</p>
        )}
      </div>
    </div>
  );
}

/** Why there is no rent to suggest (FR-RNT-03, FR-RNT-04, FR-RNT-06). */
function whyNone(failed, values) {
  if (failed) return TEXT.rentSuggestionUnavailable;
  if (!canSuggestRent(values)) return TEXT.rentSuggestionNeedsFields;
  return TEXT.rentSuggestionOutsideData;
}
