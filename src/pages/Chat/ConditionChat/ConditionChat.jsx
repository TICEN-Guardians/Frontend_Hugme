import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import { FaComments } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import {
  getEntryQuestions,
  sendGuideMessage,
} from '../../../services/userChat/userChatService.js';
import styles from './ConditionChat.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const EXIT_EASE = [0.4, 0, 1, 1];

const FEATURE_PATHS = {
  RISK_DIAGNOSIS: '/risk/new',
  DOCUMENT_GUIDE: '/doc-chat',
};

const sidebarContainerVariants = {
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

const sidebarItemVariants = {
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

const createConversation = () => ({
  id: `conversation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sessionId: null,
  messages: [],
  suggestedQuestions: [],
  redirect: null,
});

const getConversationTitle = (conversation) => {
  const firstUserMessage = conversation.messages.find((message) => message.role === 'user');
  return firstUserMessage?.content ?? '새 상담';
};

const resolveRedirectPath = (redirect) => {
  if (!redirect) return null;
  return FEATURE_PATHS[redirect.feature] ?? redirect.path ?? null;
};

export default function ConditionChat() {
  const [conversations, setConversations] = useState(() => [createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(() => conversations[0].id);
  const [entryQuestions, setEntryQuestions] = useState([]);
  const [isEntryLoading, setIsEntryLoading] = useState(true);
  const [entryError, setEntryError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0];
  const messages = activeConversation.messages;
  const followUpQuestions = activeConversation.suggestedQuestions ?? [];

  const entrySuggestionQuestions = useMemo(
    () =>
      entryQuestions
        .flatMap((group) => group.questions ?? [])
        .filter((question) => typeof question === 'string' && question.trim().length > 0),
    [entryQuestions],
  );
  const visibleEntrySuggestionQuestions = entrySuggestionQuestions.slice(0, 6);

  useEffect(() => {
    let ignore = false;

    async function loadEntryQuestions() {
      setIsEntryLoading(true);
      setEntryError(null);

      try {
        const result = await getEntryQuestions();

        if (ignore) return;
        setEntryQuestions(Array.isArray(result) ? result : []);
      } catch (error) {
        if (ignore) return;
        setEntryError(error);
      } finally {
        if (!ignore) {
          setIsEntryLoading(false);
        }
      }
    }

    loadEntryQuestions();

    return () => {
      ignore = true;
    };
  }, []);

  const sendQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) return;

    const conversationId = activeConversationId;
    const currentSessionId = activeConversation.sessionId;

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  role: 'user',
                  content: trimmedQuestion,
                },
              ],
              suggestedQuestions: [],
              redirect: null,
            }
          : conversation,
      ),
    );

    setIsSending(true);

    try {
      const response = await sendGuideMessage(currentSessionId, trimmedQuestion);

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                sessionId: response.sessionId ?? currentSessionId,
                messages: [
                  ...conversation.messages,
                  {
                    role: 'assistant',
                    content: response.answer ?? '답변을 불러왔지만 표시할 내용이 없습니다.',
                  },
                ],
                suggestedQuestions: Array.isArray(response.suggestedQuestions)
                  ? response.suggestedQuestions
                  : [],
                redirect: response.redirect ?? null,
              }
            : conversation,
        ),
      );
    } catch (error) {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  {
                    role: 'assistant',
                    content: '상담 답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
                  },
                ],
              }
            : conversation,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const startNewConversation = () => {
    const conversation = createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
  };

  const handleRedirect = () => {
    const path = resolveRedirectPath(activeConversation.redirect);
    if (!path) return;
    navigate(path);
  };

  return (
    <div className={styles.workspace}>
      <motion.aside
        className={styles.sidebar}
        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -42 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.35 : 1, ease: ENTRY_EASE }}
      >
        <motion.div
          className={styles.sidebarTop}
          custom={prefersReducedMotion}
          variants={sidebarContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className={styles.sidebarTitle}
            custom={prefersReducedMotion}
            variants={sidebarItemVariants}
          >
            조건상담
          </motion.h1>
          <motion.button
            type="button"
            className={styles.newChatButton}
            onClick={startNewConversation}
            custom={prefersReducedMotion}
            variants={sidebarItemVariants}
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
          variants={sidebarContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className={styles.historyTitle}
            custom={prefersReducedMotion}
            variants={sidebarItemVariants}
          >
            최근 대화
          </motion.p>
          <motion.div className={styles.historyList}>
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;

              return (
                <motion.button
                  key={conversation.id}
                  type="button"
                  className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                  onClick={() => setActiveConversationId(conversation.id)}
                  custom={prefersReducedMotion}
                  variants={sidebarItemVariants}
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
      </motion.aside>

      <motion.section
        className={styles.chatPanel}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 34, scale: prefersReducedMotion ? 1 : 0.988 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.35 : 1.05, delay: 0.08, ease: ENTRY_EASE }}
      >
        <div className={styles.chatMain}>
          <AnimatePresence mode="wait" custom={prefersReducedMotion}>
            {messages.length === 0 ? (
              <motion.div
                key={`empty-${activeConversationId}`}
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
                key={`conversation-${activeConversationId}`}
                className={styles.messages}
                custom={prefersReducedMotion}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={conversationVariants}
              >
                <div className={styles.thread}>
                  <MessageList messages={messages} animateMessages />
                  {isSending && (
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
                  {(followUpQuestions.length > 0 || activeConversation.redirect) && (
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
                        {activeConversation.redirect && (
                          <motion.button
                            type="button"
                            className={`${styles.followUpChip} ${styles.redirectChip}`}
                            onClick={handleRedirect}
                            custom={prefersReducedMotion}
                            variants={followUpVariants}
                            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                          >
                            {activeConversation.redirect.label ?? '관련 기능'}으로 이동
                          </motion.button>
                        )}
                      </div>
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
                messages.length === 0
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
