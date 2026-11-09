import { PAGE_SIZES } from '../../utils/sort.js';
import Button from './Button.jsx';
import { SelectField } from './FormField.jsx';
import styles from './Pager.module.css';

/**
 * Previous and Next under a long list, the page it is on, and how many rows a page shows
 * (FR-LST-10). Previous is disabled on the first page and Next on the last.
 *
 * @param {{
 *   page: number, pageCount: number, from: number, to: number, total: number,
 *   perPage: number, onPageChange: (page: number) => void,
 *   onPerPageChange: (perPage: number) => void,
 * }} props `from` and `to` are 1-based positions in the whole list.
 */
export default function Pager({
  page,
  pageCount,
  from,
  to,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}) {
  return (
    <nav className={styles.pager} aria-label="Pages">
      <div className={styles.steps}>
        <Button
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <p className={styles.position}>
          Page {page} of {pageCount}
          <span className={styles.range}>
            {' '}
            ({from} to {to} of {total})
          </span>
        </p>
        <Button
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
      <SelectField
        id="per-page"
        label="Per page"
        value={String(perPage)}
        options={PAGE_SIZES.map(String)}
        onChange={(value) => onPerPageChange(Number(value))}
      />
    </nav>
  );
}
