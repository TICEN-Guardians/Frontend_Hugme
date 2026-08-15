import { Outlet } from 'react-router-dom';
import Footer from '../components/common/Footer/Footer.jsx';
import Header from '../components/common/Header/Header.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={`${styles.main} container`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
