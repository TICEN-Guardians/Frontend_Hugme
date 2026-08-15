import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>Hugme</div>
      <nav className={styles.nav}>
        <Link to="/">랜딩</Link>
        <Link to="/products">상품/체크리스트</Link>
        <Link to="/doc-chat">서류안내챗봇</Link>
        <Link to="/user-chat">조건상담챗봇</Link>
        <Link to="/risk/new">매물위험도</Link>
        {!isAuthLoading &&
          (isAuthenticated ? (
            <>
              <span className={styles.userName}>{user?.name ?? user?.email}님</span>
              <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login">로그인</Link>
              <Link to="/auth/signup">회원가입</Link>
            </>
          ))}
      </nav>
    </header>
  );
}
