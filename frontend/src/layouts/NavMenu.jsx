import { NavLink } from 'react-router';
import { PATHS } from '../routes/paths.js';
import styles from './NavMenu.module.css';

const ITEMS = [
  { to: PATHS.dashboard, label: 'Dashboard' },
  { to: PATHS.properties, label: 'Properties' },
  { to: PATHS.addProperty, label: 'Add property' },
  // Add Market insights here once that page is built (FR-NAV-02).
  { to: PATHS.about, label: 'About' },
];

/** The navigation menu shown on every page (FR-NAV-01). */
export default function NavMenu() {
  return (
    <nav aria-label="Main">
      <ul className={styles.list}>
        {ITEMS.map(({ to, label }) => (
          <li key={to}>
            {/* NavLink sets aria-current="page" on the current page (FR-NAV-04).
                `end` matches the exact URL, so Properties is not marked on Add property. */}
            <NavLink to={to} end className={styles.link}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
