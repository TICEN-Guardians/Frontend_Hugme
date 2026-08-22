import { useState } from 'react';
import {
  FaArrowRightFromBracket,
  FaClockRotateLeft,
  FaHouse,
  FaListCheck,
  FaShieldHalved,
  FaUser,
} from 'react-icons/fa6';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import GuideChatSidebarSection from '../../chat/GuideChatSidebarSection/GuideChatSidebarSection.jsx';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import useLastRiskAnalysis from '../../../hooks/useLastRiskAnalysis.js';
import ChecklistHistorySection from './ChecklistHistorySection.jsx';
import styles from './Sidebar.module.css';

const LOGO_SRC = '/images/Logo.png';

export default function Sidebar({ showHistory = true }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { entryPath: riskEntryPath, hasLastAnalysis } = useLastRiskAnalysis(user?.email);
  const isChecklistPath =
    pathname === '/guarantee-checklist' ||
    pathname.startsWith('/guarantee-checklist/') ||
    (pathname.startsWith('/products/') && pathname.endsWith('/checklist'));

  const menuItems = [
    {
      to: riskEntryPath,
      label: '전세 위험도 진단',
      icon: <FaShieldHalved />,
      active: pathname.startsWith('/risk/'),
    },
    {
      to: '/guarantee-checklist',
      label: '보증 체크리스트',
      icon: <FaListCheck />,
      active:
        pathname.startsWith('/guarantee-checklist') || pathname.startsWith('/products'),
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.identityRegion}>
        <Link to={isAuthenticated ? '/main' : '/'} className={styles.brand}>
          <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
        </Link>

        <div className={styles.profileArea}>
          <button
            type="button"
            className={styles.profile}
            aria-expanded={isProfileOpen}
            aria-controls="sidebar-account-menu"
            onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
          >
            <span className={styles.avatar} aria-hidden="true">
              <FaUser />
            </span>
            <div className={styles.profileText}>
              <strong className={styles.userName}>
                {isAuthLoading
                  ? '불러오는 중'
                  : isAuthenticated
                    ? `${user?.name ?? '사용자'}님`
                    : '게스트'}
              </strong>
            </div>
          </button>

          {isAuthenticated && (
            <div
              id="sidebar-account-menu"
              className={styles.profileMenu}
              data-open={isProfileOpen}
              aria-hidden={!isProfileOpen}
            >
              <button
                type="button"
                className={styles.withdrawButton}
                tabIndex={isProfileOpen ? 0 : -1}
              >
                탈퇴하기
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.serviceRegion}>
        <nav className={styles.navigation} aria-label="주요 메뉴">
          <p className={styles.sectionLabel}>메뉴</p>
          <div className={styles.menuList}>
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={`${styles.menuLink} ${item.active ? styles.menuLinkActive : ''}`}
              >
                <span className={styles.menuIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {showHistory && (
          <section className={styles.history} aria-labelledby="sidebar-history-title">
            <div className={styles.historyHeading}>
              <p id="sidebar-history-title" className={styles.sectionLabel}>
                히스토리
              </p>
              <FaClockRotateLeft aria-hidden="true" />
            </div>

            {!isChecklistPath && hasLastAnalysis && (
              <Link to={riskEntryPath} className={styles.historyItem}>
                <span className={styles.historyIcon} aria-hidden="true">
                  <FaHouse />
                </span>
                <span className={styles.historyText}>
                  <strong>최근 전세 위험도 진단</strong>
                  <small>분석 결과 다시 보기</small>
                </span>
              </Link>
            )}

            <ChecklistHistorySection />
            <GuideChatSidebarSection />
          </section>
        )}
      </div>

      <div className={styles.accountAction}>
        {isAuthenticated ? (
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <FaArrowRightFromBracket aria-hidden="true" />
            로그아웃
          </button>
        ) : (
          <Link to="/auth/login" className={styles.loginLink}>
            로그인
          </Link>
        )}
      </div>
    </aside>
  );
}
