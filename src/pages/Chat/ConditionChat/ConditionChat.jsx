import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import { FaComments } from 'react-icons/fa6';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import styles from './ConditionChat.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

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

const emptyContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.09,
    },
  },
};

const emptyItemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
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
        initial={{ opacity: 0, x: -36 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: ENTRY_EASE }}
      >
        <div className={styles.sidebarTop}>
          <h1 className={styles.sidebarTitle}>조건상담</h1>
          <button type="button" className={styles.newChatButton} onClick={startNewConversation}>
            <FiPlus aria-hidden="true" />
            새 상담
          </button>
        </div>

        <div className={styles.historyBlock}>
          <p className={styles.historyTitle}>최근 대화</p>
          <div className={styles.historyList}>
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;

              return (
                <motion.button
                  key={conversation.id}
                  type="button"
                  className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                  onClick={() => setActiveConversationId(conversation.id)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <FiMessageSquare aria-hidden="true" />
                  <span>{getConversationTitle(conversation)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.aside>

      <motion.section
        className={styles.chatPanel}
        initial={{ opacity: 0, y: 28, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.95, delay: 0.08, ease: ENTRY_EASE }}
      >
        <div className={styles.chatMain}>
          {messages.length === 0 ? (
            <motion.div
              className={styles.empty}
              initial="hidden"
              animate="visible"
              variants={emptyContainerVariants}
            >
              <motion.div className={styles.emptyIcon} variants={emptyItemVariants}>
                <FaComments aria-hidden="true" />
              </motion.div>
              <motion.h2 className={styles.emptyTitle} variants={emptyItemVariants}>
                어떤 가입조건이 궁금하세요?
              </motion.h2>
              <motion.p className={styles.emptyDescription} variants={emptyItemVariants}>
                아래 조건 중 하나를 선택하면 해당 조건에 대한 상담이 시작돼요.
                <br />
                HUG 전세보증금반환보증 가입조건 17개를 하나씩 확인해 드려요.
              </motion.p>
              <motion.div className={styles.suggestions} variants={emptyItemVariants}>
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className={styles.suggestionCard}
                    onClick={() => sendQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeConversationId}
              className={styles.messages}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: ENTRY_EASE }}
            >
              <div className={styles.thread}>
                <MessageList messages={messages} animateMessages />
                <motion.div
                  className={styles.followUps}
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.72,
                        ease: ENTRY_EASE,
                        staggerChildren: 0.06,
                      },
                    },
                  }}
                >
                  <p className={styles.followUpLabel}>이어서 물어볼 수 있어요</p>
                  <div className={styles.followUpRow}>
                    {FOLLOW_UP_QUESTIONS.map((question) => (
                      <motion.button
                        key={question}
                        type="button"
                        className={styles.followUpChip}
                        onClick={() => sendQuestion(question)}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.45, ease: ENTRY_EASE }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        <div className={styles.inputDock}>
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
        </div>
      </motion.section>
    </div>
  );
}
