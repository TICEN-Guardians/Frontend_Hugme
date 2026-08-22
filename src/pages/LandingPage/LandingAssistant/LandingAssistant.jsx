import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiSend, FiX } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa6';
import { getEntryQuestions, sendGuideMessage } from '../../../api/userChat/userChatService.js';
import styles from './LandingAssistant.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function LandingAssistant({ isOpen, onClose }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [entryQuestions, setEntryQuestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAwaitingFirstToken, setIsAwaitingFirstToken] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const visibleEntryQuestions = useMemo(
    () =>
      entryQuestions
        .flatMap((group) => group.questions ?? [])
        .filter((question) => typeof question === 'string' && question.trim().length > 0)
        .slice(0, 3),
    [entryQuestions],
  );

  useEffect(() => {
    let ignore = false;

    getEntryQuestions()
      .then((result) => {
        if (!ignore) {
          setEntryQuestions(Array.isArray(result) ? result : []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setEntryQuestions([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    const node = messagesRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, [messages, isAwaitingFirstToken]);

  const sendQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) return;

    setInputValue('');
    setIsSending(true);
    setIsAwaitingFirstToken(true);
    setMessages((prev) => [...prev, { role: 'user', content: trimmedQuestion }]);

    const appendToken = (token) => {
      setIsAwaitingFirstToken(false);
      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === 'assistant') {
          const next = [...prev];
          next[next.length - 1] = { ...last, content: last.content + token };
          return next;
        }

        return [...prev, { role: 'assistant', content: token }];
      });
    };

    try {
      const response = await sendGuideMessage(sessionId, trimmedQuestion, appendToken);
      setSessionId(response.sessionId ?? sessionId);
      setMessages((prev) => {
        const finalAnswer = response.answer ?? '답변을 불러왔지만 표시할 내용이 없습니다.';
        const last = prev[prev.length - 1];

        if (last?.role === 'assistant') {
          const next = [...prev];
          next[next.length - 1] = { ...last, content: finalAnswer };
          return next;
        }

        return [...prev, { role: 'assistant', content: finalAnswer }];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '상담 답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setIsSending(false);
      setIsAwaitingFirstToken(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendQuestion(inputValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="HUGME 도우미"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18, scale: prefersReducedMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: prefersReducedMotion ? 1 : 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, ease: ENTRY_EASE }}
        >
          <header className={styles.header}>
            <div className={styles.headerTitle}>
              <span className={styles.headerIcon}>
                <FaRobot aria-hidden="true" />
              </span>
              <div>
                <h2>HUGME 도우미</h2>
                <p>조건 상담 · 용어 설명</p>
              </div>
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="HUGME 도우미 닫기">
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className={styles.messages} ref={messagesRef}>
            {messages.length === 0 && (
              <div className={styles.empty}>
                {visibleEntryQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => sendQuestion(question)}
                    disabled={isSending}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                {message.content}
              </div>
            ))}

            {isAwaitingFirstToken && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>답변을 준비하고 있어요.</div>
            )}
          </div>

          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="궁금한 내용을 입력하세요"
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || !inputValue.trim()} aria-label="질문 보내기">
              <FiSend aria-hidden="true" />
            </button>
          </form>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
