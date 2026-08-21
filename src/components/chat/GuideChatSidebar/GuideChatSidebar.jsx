import { motion, useReducedMotion } from 'framer-motion';
import { FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getConversationTitle } from '../../../hooks/useGuideChat.js';
import styles from './GuideChatSidebar.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 16,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: ENTRY_EASE,
    },
  },
};

// 조건상담 챗봇 사이드바의 "내용물"만 담당하는 컴포넌트(제목/새 상담 버튼/최근 대화 목록).
// 바깥 레이아웃(폭, 위치, 테두리 등)은 이 컴포넌트를 담는 쪽에서 정한다 — 팀원이 만드는
// 공용 사이드바 레이아웃에 그대로 꽂아 넣을 수 있도록 위치·크기 관련 스타일을 갖지 않는다.
//
// chat: useGuideChat()의 반환값을 그대로 전달한다. 이 컴포넌트가 직접 useGuideChat()을
// 호출하지 않는 이유는, 채팅 본문을 그리는 쪽과 세션 상태 인스턴스가 분리되면 서로 다른
// 대화를 보게 되는 버그가 생기기 때문(같은 훅 인스턴스를 상위에서 한 번만 만들어 내려줘야 함).
export default function GuideChatSidebar({ chat }) {
  const prefersReducedMotion = useReducedMotion();
  const {
    isAuthenticated,
    sessionId,
    sessions,
    anonConversations,
    activeAnonConversationId,
    isSending,
    startNewChat,
    selectAnonConversation,
    openSession,
    removeSession,
  } = chat;

  return (
    <>
      <motion.div
        className={styles.top}
        custom={prefersReducedMotion}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className={styles.title} custom={prefersReducedMotion} variants={itemVariants}>
          조건상담
        </motion.h1>
        <motion.button
          type="button"
          className={styles.newChatButton}
          onClick={startNewChat}
          disabled={isSending}
          custom={prefersReducedMotion}
          variants={itemVariants}
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <FiPlus aria-hidden="true" />
          새 상담
        </motion.button>
      </motion.div>

      <motion.div
        className={styles.historyBlock}
        custom={prefersReducedMotion}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p className={styles.historyTitle} custom={prefersReducedMotion} variants={itemVariants}>
          최근 대화
        </motion.p>
        <motion.div className={styles.historyList}>
          {isAuthenticated
            ? sessions.map((session) => {
                const isActive = session.sessionId === sessionId;

                return (
                  <motion.button
                    key={session.sessionId}
                    type="button"
                    className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                    onClick={() => openSession(session)}
                    disabled={isSending}
                    custom={prefersReducedMotion}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <FiMessageSquare aria-hidden="true" />
                    <span>{session.title}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="상담 삭제"
                      className={styles.historyItemDelete}
                      onClick={(event) => removeSession(event, session.sessionId)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          removeSession(event, session.sessionId);
                        }
                      }}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </span>
                  </motion.button>
                );
              })
            : anonConversations.map((conversation) => {
                const isActive = conversation.id === activeAnonConversationId;

                return (
                  <motion.button
                    key={conversation.id}
                    type="button"
                    className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                    onClick={() => selectAnonConversation(conversation.id)}
                    disabled={isSending}
                    custom={prefersReducedMotion}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <FiMessageSquare aria-hidden="true" />
                    <span>{getConversationTitle(conversation)}</span>
                  </motion.button>
                );
              })}
        </motion.div>
      </motion.div>
    </>
  );
}
