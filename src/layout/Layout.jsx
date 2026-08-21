import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/common/Footer/Footer.jsx';
import Sidebar from '../components/common/Sidebar/Sidebar.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatAppPage = pathname === '/user-chat' || pathname === '/doc-chat';
  const isChecklistDetailPage =
    pathname.startsWith('/guarantee-checklist/') ||
    (pathname.startsWith('/products/') && pathname.endsWith('/checklist'));
  const isMainPage = pathname === '/main';

  return (
    <div className={`${styles.pageWrapper} ${isChatAppPage ? styles.chatPageWrapper : ''}`}>
      <Sidebar showHistory={!isMainPage} />
      <div className={styles.contentColumn}>
        <main
          className={
            isChatAppPage
              ? `${styles.main} ${styles.chatMain}`
              : `${styles.main} ${isChecklistDetailPage ? styles.wideMain : 'container'}`
          }
        >
          <Outlet />
        </main>
        {!isChatAppPage && <Footer />}
      </div>
    </div>
  );
}
