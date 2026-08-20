import { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble/MessageBubble.jsx';
import styles from './MessageList.module.css';

export default function MessageList({ messages, animateMessages = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className={styles.list}>
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          role={message.role}
          content={message.content}
              sources={message.sources ?? []}
          animate={animateMessages}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
