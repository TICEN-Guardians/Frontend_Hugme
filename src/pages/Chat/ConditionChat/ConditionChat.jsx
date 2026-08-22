import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaComments } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import { useGuideChatContext } from '../../../context/guideChat/GuideChatContext.jsx';
import styles from './ConditionChat.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const EXIT_EASE = [0.4, 0, 1, 1];

const emptyStateVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.11,
    },
  },
  exit: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : -14,
    transition: {
      duration: 0.45,
      ease: EXIT_EASE,
    },
  }),
};

const emptyItemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 28,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: ENTRY_EASE,
    },
  },
};

const emptyTitleVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 38,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.95,
      ease: ENTRY_EASE,
    },
  },
};

const emptyIconVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.92,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: ENTRY_EASE,
    },
  },
};

const suggestionListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const suggestionItemVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 22,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.78,
      ease: ENTRY_EASE,
    },
  },
};

const conversationVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 26,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.82,
      ease: ENTRY_EASE,
    },
  },
  exit: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : -12,
    transition: {
      duration: 0.38,
      ease: EXIT_EASE,
    },
  }),
};

const followUpVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 14,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.66,
      ease: ENTRY_EASE,
    },
  },
};

// 이 페이지의 사이드바(세션 목록)는 src/components/chat/GuideChatSidebar/GuideChatSidebar.jsx로
// 분리되어 있다. 팀원이 작업 중인 공용 사이드바 레이아웃이 준비되면 그 레이아웃 안에
// <GuideChatSidebar chat={chat} />을 꽂아 넣으면 된다 — 지금은 레이아웃이 없어 이 페이지는
// 사이드바 없이 채팅 패널만 그린다.
export default function ConditionChat() {
  const {
    currentMessages,
    currentSuggestedQuestions,
    currentRedirect,
    activeThreadKey,
    entrySuggestionQuestions,
    isEntryLoading,
    entryError,
    isSending,
    isWaitingForAnswer,
    isLoginConfirmPending,
    confirmLogin,
    cancelLogin,
    sendQuestion,
    handleRedirect,
  } = useGuideChatContext();
  const prefersReducedMotion = useReducedMotion();

  const followUpQuestions = currentSuggestedQuestions;
  const visibleEntrySuggestionQuestions = entrySuggestionQuestions.slice(0, 6);

  return (
    <div className={styles.workspace}>
      <motion.section
        className={styles.chatPanel}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 34, scale: prefersReducedMotion ? 1 : 0.988 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.35 : 1.05, delay: 0.08, ease: ENTRY_EASE }}
      >
        <div className={styles.chatMain}>
          <AnimatePresence mode="wait" custom={prefersReducedMotion}>
            {currentMessages.length === 0 ? (
              <motion.div
                key={`empty-${activeThreadKey}`}
                className={styles.empty}
                custom={prefersReducedMotion}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={emptyStateVariants}
              >
                <motion.div
                  className={styles.emptyIcon}
                  custom={prefersReducedMotion}
                  variants={emptyIconVariants}
                >
                  <FaComments aria-hidden="true" />
                </motion.div>
                <motion.h2
                  className={styles.emptyTitle}
                  custom={prefersReducedMotion}
                  variants={emptyTitleVariants}
                >
                  어떤 가입조건이 궁금하세요?
                </motion.h2>
                <motion.p
                  className={styles.emptyDescription}
                  custom={prefersReducedMotion}
                  variants={emptyItemVariants}
                >
                  아래 조건 중 하나를 선택하면 해당 조건에 대한 상담이 시작돼요.
                  <br />
                  HUG 전세보증금반환보증 가입조건 17개를 하나씩 확인해 드려요.
                </motion.p>
                <motion.div
                  className={styles.suggestions}
                  variants={suggestionListVariants}
                >
                  {isEntryLoading && (
                    <motion.div
                      className={`${styles.suggestionCard} ${styles.suggestionNotice}`}
                      custom={prefersReducedMotion}
                      variants={suggestionItemVariants}
                    >
                      추천 질문을 불러오는 중입니다.
                    </motion.div>
                  )}
                  {!isEntryLoading && entryError && (
                    <motion.div
                      className={`${styles.suggestionCard} ${styles.suggestionNotice}`}
                      custom={prefersReducedMotion}
                      variants={suggestionItemVariants}
                    >
                      추천 질문을 불러오지 못했습니다. 아래 입력창에 직접 질문해주세요.
                    </motion.div>
                  )}
                  {!isEntryLoading &&
                    !entryError &&
                    visibleEntrySuggestionQuestions.map((question) => (
                      <motion.button
                        key={question}
                        type="button"
                        className={styles.suggestionCard}
                        onClick={() => sendQuestion(question)}
                        disabled={isSending}
                        custom={prefersReducedMotion}
                        variants={suggestionItemVariants}
                        whileHover={prefersReducedMotion || isSending ? undefined : { y: -2 }}
                        whileTap={prefersReducedMotion || isSending ? undefined : { scale: 0.99 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        {question}
                      </motion.button>
                    ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={`conversation-${activeThreadKey}`}
                className={styles.messages}
                custom={prefersReducedMotion}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={conversationVariants}
              >
                <div className={styles.thread}>
                  <MessageList messages={currentMessages} animateMessages />
                  {isWaitingForAnswer && (
                    <motion.div
                      className={styles.typingRow}
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, ease: ENTRY_EASE }}
                      aria-live="polite"
                    >
                      <div className={styles.typingBubble}>
                        <span className={styles.typingText}>답변을 생각하는 중</span>
                        <span className={styles.typingDots} aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {(followUpQuestions.length > 0 || currentRedirect) && (
                    <motion.div
                      className={styles.followUps}
                      custom={prefersReducedMotion}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {
                          opacity: 0,
                        },
                        visible: {
                          opacity: 1,
                          transition: {
                            delayChildren: 0.16,
                            staggerChildren: 0.07,
                          },
                        },
                      }}
                    >
                      {isLoginConfirmPending ? (
                        <>
                          <motion.p
                            className={styles.followUpLabel}
                            custom={prefersReducedMotion}
                            variants={followUpVariants}
                          >
                            로그인이 필요한 기능이에요. 로그인 페이지로 이동할까요?
                          </motion.p>
                          <div className={styles.followUpRow}>
                            <motion.button
                              type="button"
                              className={`${styles.followUpChip} ${styles.redirectChip}`}
                              onClick={confirmLogin}
                              custom={prefersReducedMotion}
                              variants={followUpVariants}
                              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                              whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              예
                            </motion.button>
                            <motion.button
                              type="button"
                              className={styles.followUpChip}
                              onClick={cancelLogin}
                              custom={prefersReducedMotion}
                              variants={followUpVariants}
                              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                              whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              아니오
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <>
                          <motion.p
                            className={styles.followUpLabel}
                            custom={prefersReducedMotion}
                            variants={followUpVariants}
                          >
                            이어서 물어볼 수 있어요
                          </motion.p>
                          <div className={styles.followUpRow}>
                            {followUpQuestions.map((question) => (
                              <motion.button
                                key={question}
                                type="button"
                                className={styles.followUpChip}
                                onClick={() => sendQuestion(question)}
                                disabled={isSending}
                                custom={prefersReducedMotion}
                                variants={followUpVariants}
                                whileHover={prefersReducedMotion || isSending ? undefined : { y: -1 }}
                                whileTap={prefersReducedMotion || isSending ? undefined : { scale: 0.985 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                              >
                                {question}
                              </motion.button>
                            ))}
                            {currentRedirect && (
                              <motion.button
                                type="button"
                                className={`${styles.followUpChip} ${styles.redirectChip}`}
                                onClick={handleRedirect}
                                custom={prefersReducedMotion}
                                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                variants={followUpVariants}
                              >
                                {currentRedirect.label ?? '관련 기능'}으로 이동
                              </motion.button>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className={styles.inputDock}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.3 : 0.9, delay: 0.38, ease: ENTRY_EASE }}
        >
          <div className={styles.inputInner}>
            <ChatInput
              onSend={sendQuestion}
              disabled={isSending}
              placeholder={
                currentMessages.length === 0
                  ? '궁금한 가입조건을 선택하거나 직접 입력하세요'
                  : '추천 질문을 선택하거나 직접 입력하세요'
              }
            />
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
