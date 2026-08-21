import { motion, useReducedMotion } from 'framer-motion';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { FaComments } from 'react-icons/fa6';
import ChatInput from '../../chat/ChatInput/ChatInput.jsx';
import MessageList from '../../chat/MessageList/MessageList.jsx';
import styles from './FloatingChatStage1.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

// chat: useGuideChat()의 반환값. 세션/대화 상태는 FloatingChatWidget이 한 번만 소유하고
// 여기로 내려받아 쓴다 — 1단계<->2단계 전환 시 대화가 끊기지 않게 하기 위함.
export default function FloatingChatStage1({ chat, onClose, onExpand }) {
  const prefersReducedMotion = useReducedMotion();
  const {
    currentMessages,
    currentSuggestedQuestions,
    currentRedirect,
    entrySuggestionQuestions,
    isSending,
    isWaitingForAnswer,
    isLoginConfirmPending,
    confirmLogin,
    cancelLogin,
    sendQuestion,
    handleRedirect,
  } = chat;

  const visibleEntryQuestions = entrySuggestionQuestions.slice(0, 4);

  return (
    <motion.div
      className={styles.panel}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24, scale: prefersReducedMotion ? 1 : 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.97 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.32, ease: ENTRY_EASE }}
    >
      <div className={styles.header}>
        <span className={styles.title}>조건상담 챗봇</span>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconButton} onClick={onExpand} aria-label="자세히 보기">
            <FiMaximize2 aria-hidden="true" />
          </button>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="닫기">
            <FiX aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {currentMessages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <FaComments aria-hidden="true" />
            </div>
            <p className={styles.emptyTitle}>어떤 가입조건이 궁금하세요?</p>
            <div className={styles.emptySuggestions}>
              {visibleEntryQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className={styles.suggestionChip}
                  onClick={() => sendQuestion(question)}
                  disabled={isSending}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.thread}>
            <MessageList messages={currentMessages} animateMessages />
            {isWaitingForAnswer && (
              <div className={styles.typingRow} aria-live="polite">
                답변을 생각하는 중...
              </div>
            )}
            {isLoginConfirmPending ? (
              <div className={styles.followUps}>
                <p className={styles.followUpLabel}>로그인이 필요한 기능이에요. 로그인 페이지로 이동할까요?</p>
                <div className={styles.followUpRow}>
                  <button type="button" className={`${styles.followUpChip} ${styles.redirectChip}`} onClick={confirmLogin}>
                    예
                  </button>
                  <button type="button" className={styles.followUpChip} onClick={cancelLogin}>
                    아니오
                  </button>
                </div>
              </div>
            ) : (
              (currentSuggestedQuestions.length > 0 || currentRedirect) && (
                <div className={styles.followUps}>
                  <div className={styles.followUpRow}>
                    {currentSuggestedQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        className={styles.followUpChip}
                        onClick={() => sendQuestion(question)}
                        disabled={isSending}
                      >
                        {question}
                      </button>
                    ))}
                    {currentRedirect && (
                      <button
                        type="button"
                        className={`${styles.followUpChip} ${styles.redirectChip}`}
                        onClick={handleRedirect}
                      >
                        {currentRedirect.label ?? '관련 기능'}으로 이동
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className={styles.inputDock}>
        <ChatInput
          onSend={sendQuestion}
          disabled={isSending}
          placeholder="궁금한 점을 입력하세요"
        />
      </div>
    </motion.div>
  );
}
