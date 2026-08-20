import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import useLastRiskAnalysis from '../../../hooks/useLastRiskAnalysis.js';
import styles from './Header.module.css';

const LOGO_SRC = '/images/Logo.png';

export default function Header() {
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
  const { entryPath: riskEntryPath } = useLastRiskAnalysis(user?.email);
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { to: riskEntryPath, label: '매물위험도', isActive: location.pathname.startsWith('/risk/') },
    { to: '/doc-chat', label: '서류안내챗봇' },
    { to: '/user-chat', label: '조건상담챗봇' },
    { to: '/guarantee-checklist', label: '보증 체크리스트' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAuthLoading) {
    return (
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.innerGuest} container`}>
          <Link to="/" className={styles.brand}>
            <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
          </Link>
          <div />
        </div>
      </header>
    );
  }

  if (isAuthenticated) {
    return (
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.innerAuthed} container`}>
          <Link to="/" className={styles.brand}>
            <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
          </Link>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${(item.isActive ?? isActive) ? styles.navLinkActive : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <span className={styles.avatar} aria-hidden="true" />
            <span className={styles.userName}>{user?.name ?? user?.email}님</span>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${styles.innerGuest} container`}>
        <Link to="/" className={styles.brand}>
          <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
        </Link>
        <div className={styles.actions}>
          <Link to="/auth/login" className={styles.outlineButton}>
            로그인
          </Link>
          <Link to="/auth/signup" className={styles.filledButton}>
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}
