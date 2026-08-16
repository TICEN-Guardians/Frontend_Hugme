import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import { FaComments } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import styles from './ConditionChat.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const EXIT_EASE = [0.4, 0, 1, 1];

const SUGGESTED_QUESTIONS = [
  '내 계약, 지금 조건으로 가입할 수 있나요?',
  '전세가율 90% 조건이 무슨 뜻인가요?',
  '조건이 미충족이면 어떻게 해야 하나요?',
];

const FOLLOW_UP_QUESTIONS = [
  '보증금을 낮추면 계약을 다시 써야 하나요?',
  '전세가율은 어떻게 계산하나요?',
  '다른 보증상품은 가입할 수 있나요?',
];

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
  messages: [],
});

const getConversationTitle = (conversation) => {
  const firstUserMessage = conversation.messages.find((message) => message.role === 'user');
  return firstUserMessage?.content ?? '새 상담';
};

export default function ConditionChat() {
  const [conversations, setConversations] = useState(() => [createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(() => conversations[0].id);
  const prefersReducedMotion = useReducedMotion();
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0];
  const messages = activeConversation.messages;

  const sendQuestion = (question) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== activeConversationId) return conversation;

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            { role: 'user', content: question },
            // API 없음 — 고정 문구로만 응답
            {
              role: 'assistant',
              content: '아직 데모 화면이라 실제 상담 답변은 준비 중이에요. 곧 연결될 예정입니다.',
            },
          ],
        };
      }),
    );
  };

  const startNewConversation = () => {
    const conversation = createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
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
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <motion.button
                      key={question}
                      type="button"
                      className={styles.suggestionCard}
                      onClick={() => sendQuestion(question)}
                      custom={prefersReducedMotion}
                      variants={suggestionItemVariants}
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
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
                      {FOLLOW_UP_QUESTIONS.map((question) => (
                        <motion.button
                          key={question}
                          type="button"
                          className={styles.followUpChip}
                          onClick={() => sendQuestion(question)}
                          custom={prefersReducedMotion}
                          variants={followUpVariants}
                          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
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
