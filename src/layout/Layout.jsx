import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/common/Footer/Footer.jsx';
import Header from '../components/common/Header/Header.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();
  const isChatAppPage = pathname === '/user-chat';

  return (
    <div className={`${styles.pageWrapper} ${isChatAppPage ? styles.chatPageWrapper : ''}`}>
      <Header />
      <main className={isChatAppPage ? `${styles.main} ${styles.chatMain}` : `${styles.main} container`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
