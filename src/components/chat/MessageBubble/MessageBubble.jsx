import styles from './MessageBubble.module.css';

export default function MessageBubble({ role, content }) {
  return (
    <div className={`${styles.row} ${role === 'user' ? styles.rowUser : ''}`}>
      <div className={`${styles.bubble} ${styles[role]}`}>{content}</div>
    </div>
  );
}
