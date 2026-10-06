import { COURSE } from '../constants/team.js';
import styles from './Footer.module.css';

/** The footer on every page: the course, the data credit and the reload notice (UI-01, FR-DAT-06). */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          {COURSE.code} · {COURSE.term} · {COURSE.part}
        </p>
        <p>Sample data: Saudi Arabia Real Estate (AQAR), Kaggle, 2021.</p>
        <p>Changes are kept only until the page reloads.</p>
      </div>
    </footer>
  );
}
