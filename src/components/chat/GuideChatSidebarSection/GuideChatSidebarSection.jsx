import { FaComments, FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGuideChatContext } from '../../../context/guideChat/GuideChatContext.jsx';
import styles from './GuideChatSidebarSection.module.css';

const MAX_SESSIONS_SHOWN = 2;

// 공통 Sidebar의 "히스토리" 구역에 꽂아 넣는 상담 챗봇 전용 섹션. 세션 목록 조회, 새 상담
// 시작, 세션 클릭 시 이동까지 챗봇 관련 로직을 전부 이 컴포넌트 안에 담아서, 공통 Sidebar는
// 이 컴포넌트를 그대로 렌더링만 하면 되게 한다(다른 기능도 같은 방식으로 자기 섹션을 만들어
// 히스토리 구역에 꽂을 수 있도록). 언제 숨길지도 이 컴포넌트가 스스로 판단한다.
export default function GuideChatSidebarSection() {
  const { sessions } = useGuideChatContext();
  const navigate = useNavigate();

  const startNewSession = () => {
    navigate('/user-chat', { state: { startNewGuideSession: true } });
  };

  const openSession = (session) => {
    navigate('/user-chat', { state: { openGuideSessionId: session.sessionId } });
  };

  return (
    <div className={styles.section}>
      <p className={styles.groupTitle}>최근 대화</p>
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
          </span>
        </button>
      ))}
    </div>
  );
}
