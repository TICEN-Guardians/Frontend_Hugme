import { useEffect, useState } from 'react';
import { FaComments, FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import {
  DOCUMENT_CHAT_HISTORY_UPDATED_EVENT,
  getDocumentChatSessions,
} from '../../../utils/documentChatHistoryStorage.js';
import styles from '../GuideChatSidebarSection/GuideChatSidebarSection.module.css';

const MAX_SESSIONS_SHOWN = 2;

export default function DocumentChatSidebarSection() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(() => getDocumentChatSessions(user?.email));
  const navigate = useNavigate();

  useEffect(() => {
    const syncSessions = () => setSessions(getDocumentChatSessions(user?.email));
    syncSessions();
    window.addEventListener(DOCUMENT_CHAT_HISTORY_UPDATED_EVENT, syncSessions);
    window.addEventListener('storage', syncSessions);

    return () => {
      window.removeEventListener(DOCUMENT_CHAT_HISTORY_UPDATED_EVENT, syncSessions);
      window.removeEventListener('storage', syncSessions);
    };
  }, [user?.email]);

  return (
    <div className={styles.section}>
      <p className={styles.groupTitle}>최근 대화</p>
      <button
        type="button"
        className={`${styles.item} ${styles.itemNew}`}
        onClick={() => navigate('/doc-chat', { state: { startNewDocumentChat: true } })}
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
          key={session.conversationId}
          type="button"
          className={styles.item}
          onClick={() => navigate('/doc-chat', {
            state: { openDocumentChatConversationId: session.conversationId },
          })}
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
