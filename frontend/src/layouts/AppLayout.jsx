import { Outlet } from 'react-router';
import Message from '../components/ui/Message.jsx';
import { usePortfolio } from '../hooks/usePortfolio.js';
import Footer from './Footer.jsx';
import NavMenu from './NavMenu.jsx';
import styles from './AppLayout.module.css';

/** The layout every page shares: a header with the app name and menu, the page content, a footer (UI-01). */
export default function AppLayout() {
  const { message, clearMessage } = usePortfolio();

  return (
    <div className={styles.shell}>
      {/* Lets a keyboard user jump past the menu on every page (WCAG 2.4.1). It is hidden until
          it is focused. */}
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              D
            </span>
            {/* A product name, which machine translation should leave alone. */}
            <span translate="no">Darscope</span>
          </span>
          <NavMenu />
        </div>
      </header>

      <main className={styles.main} id="main" tabIndex={-1}>
        {/* One live region for the whole app, above the page content, so every confirmation is
            announced wherever the action happened (FR-FBK-01, FR-FBK-02). */}
        <Message text={message} onDismiss={clearMessage} />
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
