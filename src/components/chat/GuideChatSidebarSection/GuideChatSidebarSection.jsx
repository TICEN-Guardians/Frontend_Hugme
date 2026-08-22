import { useEffect, useState } from 'react';
import { FaComments, FaPlus } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import { getGuideSessions } from '../../../api/userChat/userChatService.js';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import { GUIDE_SESSIONS_UPDATED_EVENT } from '../../../hooks/useGuideChat.js';
import styles from './GuideChatSidebarSection.module.css';

const MAX_SESSIONS_SHOWN = 2;

// 다른 메뉴(전세 위험도 진단/보증 체크리스트) 화면에서는 그 메뉴 자신의 히스토리를 보여줘야
// 하므로, 이 상담 챗봇 섹션은 해당 경로에서 숨긴다. Sidebar.jsx의 menuItems active 조건과
// 동일한 경로 규칙을 그대로 따른다.
const isFeatureSpecificHistoryPath = (pathname) =>
  pathname.startsWith('/risk/') ||
  pathname.startsWith('/guarantee-checklist') ||
  pathname.startsWith('/products');

// 공통 Sidebar의 "히스토리" 구역에 꽂아 넣는 상담 챗봇 전용 섹션. 세션 목록 조회, 새 상담
// 시작, 세션 클릭 시 이동까지 챗봇 관련 로직을 전부 이 컴포넌트 안에 담아서, 공통 Sidebar는
// 이 컴포넌트를 그대로 렌더링만 하면 되게 한다(다른 기능도 같은 방식으로 자기 섹션을 만들어
// 히스토리 구역에 꽂을 수 있도록). 언제 숨길지도 이 컴포넌트가 스스로 판단한다.
export default function GuideChatSidebarSection() {
  const [sessions, setSessions] = useState([]);
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setSessions([]);
      return undefined;
    }

    let ignore = false;

    const fetchSessions = () => {
      getGuideSessions()
        .then((result) => {
          if (ignore) return;
          setSessions(Array.isArray(result) ? result : []);
        })
        .catch(() => {
          if (ignore) return;
          setSessions([]);
        });
    };

    fetchSessions();
    window.addEventListener(GUIDE_SESSIONS_UPDATED_EVENT, fetchSessions);

    return () => {
      ignore = true;
      window.removeEventListener(GUIDE_SESSIONS_UPDATED_EVENT, fetchSessions);
    };
  }, [isAuthenticated, isAuthLoading]);

  const startNewSession = () => {
    navigate('/user-chat', { state: { startNewGuideSession: true } });
  };

  const openSession = (session) => {
    navigate('/user-chat', { state: { openGuideSessionId: session.sessionId } });
  };

  if (isFeatureSpecificHistoryPath(pathname)) {
    return null;
  }

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={`${styles.item} ${styles.itemNew}`}
        onClick={startNewSession}
      >
        <span className={styles.icon} aria-hidden="true">
          <FaPlus />
        </span>
        <span className={styles.text}>
          <strong>새 상담 진행하기</strong>
        </span>
      </button>

      {sessions.slice(0, MAX_SESSIONS_SHOWN).map((session) => (
        <button
          key={session.sessionId}
          type="button"
          className={styles.item}
          onClick={() => openSession(session)}
        >
          <span className={styles.icon} aria-hidden="true">
            <FaComments />
          </span>
          <span className={styles.text}>
            <strong>{session.title}</strong>
            <small>상담 이어보기</small>
          </span>
        </button>
      ))}
    </div>
  );
}
