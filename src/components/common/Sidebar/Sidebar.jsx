import { useEffect, useRef, useState } from 'react';
import {
  FaArrowRightFromBracket,
  FaBars,
  FaClockRotateLeft,
  FaComments,
  FaHouse,
  FaListCheck,
  FaShieldHalved,
  FaUser,
} from 'react-icons/fa6';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import GuideChatSidebarSection from '../../chat/GuideChatSidebarSection/GuideChatSidebarSection.jsx';
import DocumentChatSidebarSection from '../../chat/DocumentChatSidebarSection/DocumentChatSidebarSection.jsx';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import useLastRiskAnalysis from '../../../hooks/useLastRiskAnalysis.js';
import { getCompletedApplications } from '../../../api/checklist/checklistService.js';
import { LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY } from '../../../hooks/useContractUpload.js';
import { PRODUCT_DETAIL_PATH } from '../../../constants/products.js';
import styles from './Sidebar.module.css';

const LOGO_SRC = '/images/Logo.png';
const LOGO_MARK_SRC = '/images/favicon.png';
const NARROW_VIEWPORT_QUERY = '(max-width: 76.7rem)';
const MAX_CHECKLIST_HISTORY_SHOWN = 2;

const CHECKLIST_TITLE = {
  GENERAL: '전세보증금반환보증',
  SPECIAL: '특례반환보증',
};

export default function Sidebar({ showHistory = true, mode = 'default' }) {
  const profileAreaRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [completedApplications, setCompletedApplications] = useState([]);
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => window.matchMedia(NARROW_VIEWPORT_QUERY).matches,
  );
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (mode === 'main' || window.matchMedia(NARROW_VIEWPORT_QUERY).matches) return true;
    return false;
  });
  const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { entryPath: riskEntryPath, hasLastAnalysis } = useLastRiskAnalysis(user?.email);
  const historyType = pathname.startsWith('/risk/')
    ? 'risk'
    : pathname.startsWith('/guarantee-checklist') || pathname.startsWith('/products')
      ? 'checklist'
      : pathname === '/user-chat'
        ? 'guideChat'
        : pathname === '/doc-chat'
          ? 'documentChat'
          : null;

  useEffect(() => {
    setIsProfileOpen(false);
    setIsCollapsed(
      mode === 'main' || isNarrowViewport
        ? true
        : false,
    );
  }, [isNarrowViewport, mode, pathname]);

  useEffect(() => {
    if (historyType !== 'checklist' || isAuthLoading || !isAuthenticated) {
      setCompletedApplications([]);
      return undefined;
    }

    let ignore = false;
    getCompletedApplications()
      .then((applications) => {
        if (!ignore) setCompletedApplications(applications);
      })
      .catch(() => {
        if (!ignore) setCompletedApplications([]);
      });

    return () => {
      ignore = true;
    };
  }, [historyType, isAuthenticated, isAuthLoading, pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const handleViewportChange = (event) => setIsNarrowViewport(event.matches);

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!profileAreaRef.current?.contains(event.target)) setIsProfileOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

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

  const toggleSidebar = () => {
    setIsCollapsed((current) => !current);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const historyTrigger = {
    risk: { label: '전세 위험도 진단 이력', icon: <FaClockRotateLeft /> },
    checklist: { label: '맞춤서류 이전 내역', icon: <FaListCheck /> },
    guideChat: { label: '최근 대화', icon: <FaComments /> },
    documentChat: { label: '최근 대화', icon: <FaComments /> },
  }[historyType];

  const openCompletedApplication = (application) => {
    const applicationId = application.applicationId ?? application.id;
    if (applicationId != null) {
      sessionStorage.setItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY, String(applicationId));
    }
    navigate(PRODUCT_DETAIL_PATH[application.productCode] ?? '/guarantee-checklist');
  };

  const usesOverlaySidebar = mode === 'main' || isNarrowViewport;

  return (
    <div
      className={`${styles.sidebarSlot} ${usesOverlaySidebar ? styles.overlaySidebarSlot : ''}`}
    >
      {usesOverlaySidebar && !isCollapsed && (
        <button
          type="button"
          className={styles.overlayBackdrop}
          aria-label="사이드바 닫기"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${usesOverlaySidebar ? styles.mainSidebar : ''}`}
        data-collapsed={isCollapsed}
      >
        <div className={styles.identityRegion}>
          <Link to={isAuthenticated ? '/main' : '/'} className={styles.brand}>
            <img src={LOGO_MARK_SRC} alt="" className={styles.logoMark} aria-hidden="true" />
            <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
          </Link>

          <div ref={profileAreaRef} className={styles.profileArea}>
            <button
              type="button"
              className={styles.profile}
              aria-expanded={isProfileOpen}
              aria-controls="sidebar-account-menu"
              title={isCollapsed ? (user?.name ?? '사용자') : undefined}
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
                  title={isCollapsed ? item.label : undefined}
                  className={`${styles.menuLink} ${item.active ? styles.menuLinkActive : ''}`}
                >
                  <span className={styles.menuIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.menuText}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {showHistory && historyTrigger && (
            <button
              type="button"
              className={styles.collapsedHistoryButton}
              aria-label={`${historyTrigger.label} 펼치기`}
              title={historyTrigger.label}
              onClick={() => setIsCollapsed(false)}
            >
              {historyTrigger.icon}
            </button>
          )}

          {showHistory && historyType && (
            <section className={styles.history} aria-label="서비스 이용 내역">
              {historyType === 'risk' && (
                <div className={styles.historyGroup}>
                  <p className={styles.historyGroupTitle}>전세 위험도 진단 이력</p>
                  {hasLastAnalysis && (
                    <Link to={riskEntryPath} className={styles.historyItem}>
                      <span className={styles.historyIcon} aria-hidden="true">
                        <FaHouse />
                      </span>
                      <span className={styles.historyText}>
                        <strong>최근 진단 결과</strong>
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {historyType === 'checklist' && (
                <div className={styles.historyGroup}>
                  <p className={styles.historyGroupTitle}>맞춤서류 이전 내역</p>
                  {completedApplications
                    .slice(0, MAX_CHECKLIST_HISTORY_SHOWN)
                    .map((application, index) => {
                      const title = application.productName
                        ?? CHECKLIST_TITLE[application.productCode];
                      if (!title) return null;

                      return (
                        <button
                          key={application.applicationId ?? application.id ?? `${application.productCode}-${index}`}
                          type="button"
                          className={`${styles.historyItem} ${styles.historyButton}`}
                          onClick={() => openCompletedApplication(application)}
                        >
                          <span className={`${styles.historyIcon} ${styles.checklistHistoryIcon}`} aria-hidden="true">
                            <FaListCheck />
                          </span>
                          <span className={styles.historyText}>
                            <strong>{title}</strong>
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}

              {historyType === 'guideChat' && <GuideChatSidebarSection />}
              {historyType === 'documentChat' && <DocumentChatSidebarSection />}
            </section>
          )}
        </div>

        <div className={styles.accountAction}>
          {isAuthenticated ? (
            <button
              type="button"
              className={styles.logoutButton}
              title={isCollapsed ? '로그아웃' : undefined}
              onClick={handleLogout}
            >
              <FaArrowRightFromBracket aria-hidden="true" />
              <span className={styles.accountText}>로그아웃</span>
            </button>
          ) : (
            <Link
              to="/auth/login"
              className={styles.loginLink}
              title={isCollapsed ? '로그인' : undefined}
            >
              <FaArrowRightFromBracket aria-hidden="true" />
              <span className={styles.accountText}>로그인</span>
            </Link>
          )}
        </div>

        {usesOverlaySidebar && (
          <button
            type="button"
            className={styles.collapseButton}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>
        )}
      </aside>
    </div>
  );
}
