import { useId, useRef, useState } from 'react';
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

/**
 * The navigation menu shown on every page (FR-NAV-01). Below 768 px it folds behind a Menu
 * button (FR-NAV-08); the CSS decides when the button shows, so the state here only matters on a
 * narrow screen.
 */
export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const listId = useId();

  /** Esc closes the open menu and hands focus back to the button that opened it. */
  function handleKeyDown(/** @type {import('react').KeyboardEvent} */ event) {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  }

  return (
    <nav aria-label="Main" className={styles.nav} onKeyDown={handleKeyDown}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.bars} aria-hidden="true" />
        Menu
      </button>
      <ul id={listId} className={styles.list} data-open={open}>
        {ITEMS.map(({ to, label }) => (
          <li key={to}>
            {/* NavLink sets aria-current="page" on the current page (FR-NAV-04).
                `end` matches the exact URL, so Properties is not marked on Add property.
                Choosing an item folds the narrow-screen menu away again. */}
            <NavLink
              to={to}
              end
              className={styles.link}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
