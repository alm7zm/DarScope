import { COURSE, DATASET } from '../constants/team.js';
import styles from './Footer.module.css';

/**
 * The footer on every page: the course and the data credit (UI-01). Part 1 also said changes
 * lasted only until a reload (FR-DAT-06); Part 2 keeps them on the server, and the team chose to
 * show no notice at all.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          {COURSE.code} · {COURSE.term}
        </p>
        {/* The sample properties are written by hand; only the rent model learns from the
            dataset, until task 1 builds the seed from it too. */}
        <p>
          Rent model data: {DATASET.name}, {DATASET.source}, {DATASET.year}.
        </p>
      </div>
    </footer>
  );
}
