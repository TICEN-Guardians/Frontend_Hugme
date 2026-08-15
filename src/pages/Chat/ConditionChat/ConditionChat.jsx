import { useState } from 'react';
import ChatInput from '../../../components/chat/ChatInput/ChatInput.jsx';
import MessageList from '../../../components/chat/MessageList/MessageList.jsx';
import styles from './ConditionChat.module.css';

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

export default function ConditionChat() {
  const [messages, setMessages] = useState([]);

  const sendQuestion = (question) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      // API 없음 — 고정 문구로만 응답
      {
        role: 'assistant',
        content: '아직 데모 화면이라 실제 상담 답변은 준비 중이에요. 곧 연결될 예정입니다.',
      },
    ]);
  };

  if (messages.length === 0) {
    return (
      <div className={styles.emptyRoot}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💬</div>
          <h1 className={styles.emptyTitle}>어떤 가입조건이 궁금하세요?</h1>
          <p className={styles.emptyDescription}>
            아래 조건 중 하나를 선택하면 해당 조건에 대한 상담이 시작돼요.
            <br />
            HUG 전세보증금반환보증 가입조건 17개를 하나씩 확인해 드려요.
          </p>
          <div className={styles.suggestions}>
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
          </div>
        </div>

        <ChatInput onSend={sendQuestion} placeholder="궁금한 가입조건을 선택하거나 직접 입력하세요" />
      </div>
    );
  }

  return (
    <div className={styles.chatRoot}>
      <div className={styles.messages}>
        <MessageList messages={messages} />
        <div className={styles.followUps}>
          <p className={styles.followUpLabel}>이어서 물어볼 수 있어요</p>
          <div className={styles.followUpRow}>
            {FOLLOW_UP_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className={styles.followUpChip}
                onClick={() => sendQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChatInput onSend={sendQuestion} placeholder="추천 질문을 선택하거나 직접 입력하세요" />
    </div>
  );
}
