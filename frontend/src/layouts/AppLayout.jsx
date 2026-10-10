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
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>Darscope</span>
          <NavMenu />
        </div>
      </header>
      <main className={styles.main}>
        {/* One live region for the whole app, above the page content, so every confirmation is
            announced wherever the action happened (FR-FBK-01, FR-FBK-02). */}
        <Message text={message} onDismiss={clearMessage} />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
