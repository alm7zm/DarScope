import { Outlet } from 'react-router';
import Footer from './Footer.jsx';
import NavMenu from './NavMenu.jsx';
import styles from './AppLayout.module.css';

/** The layout every page shares: a header with the app name and menu, the page content, a footer (UI-01). */
export default function AppLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>Darscope</span>
          <NavMenu />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
