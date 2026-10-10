import { Link } from 'react-router';
import { PATHS } from '../../routes/paths.js';
import styles from './PropertyNotFound.module.css';

/**
 * What the detail page and the edit form both show for an ID that never existed or has just been
 * deleted (FR-DET-03, AC-07). The page heading above it is the message from Appendix C.
 * @param {{ id: string }} props
 */
export default function PropertyNotFound({ id }) {
  return (
    <div className={styles.panel}>
      <p className={styles.explanation}>
        No property has the ID {id}. It may have been deleted.
      </p>
      <Link to={PATHS.properties} className={styles.back}>
        Back to list
      </Link>
    </div>
  );
}
