import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>Hugme</div>
      <nav className={styles.nav}>
        <Link to="/">랜딩</Link>
        <Link to="/login">로그인</Link>
        <Link to="/signup">회원가입</Link>
        <Link to="/main">메인</Link>
      </nav>
    </header>
  );
}
