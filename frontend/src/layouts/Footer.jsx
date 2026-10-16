import { COURSE, DATASET } from '../constants/team.js';
import styles from './Footer.module.css';

/** The footer on every page: the course, the data credit and the reload notice (UI-01, FR-DAT-06). */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          {COURSE.code} · {COURSE.term} · {COURSE.part}
        </p>
        {/* The sample properties are written by hand; only the rent model learns from the
            dataset, until task 1 builds the seed from it too. */}
        <p>
          Rent model data: {DATASET.name}, {DATASET.source}, {DATASET.year}.
        </p>
        <p className={styles.notice}>
          Changes are kept only until the page reloads.
        </p>
      </div>
    </footer>
  );
}
