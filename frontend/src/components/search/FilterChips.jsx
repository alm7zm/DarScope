import { activeFilterChips } from '../../utils/search.js';
import styles from './FilterChips.module.css';

/**
 * One removable chip per filter that is set, under the search box, so the user can see what is
 * narrowing the list and undo any one of it without opening the filter panel (FR-SRC-13). Renders
 * nothing when no filter is set.
 *
 * @param {{
 *   filters: Record<string, unknown>,
 *   onRemove: (chip: ReturnType<typeof activeFilterChips>[number]) => void,
 * }} props `onRemove` gets the chip: its `name` is the filter to change, and its `value` the one
 *   entry to take out, or null to clear the whole filter.
 */
export default function FilterChips({ filters, onRemove }) {
  const chips = activeFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <ul className={styles.chips} aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.id}>
          <button
            type="button"
            className={styles.chip}
            onClick={() => onRemove(chip)}
            aria-label={`Remove filter: ${chip.label}`}
          >
            <span>{chip.label}</span>
            <span aria-hidden="true" className={styles.cross}>
              ×
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
