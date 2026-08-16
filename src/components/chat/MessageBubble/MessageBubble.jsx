import { motion } from 'framer-motion';
import styles from './MessageBubble.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function MessageBubble({ role, content, animate = false }) {
  const className = `${styles.row} ${role === 'user' ? styles.rowUser : ''}`;
  const bubble = <div className={`${styles.bubble} ${styles[role]}`}>{content}</div>;

  if (!animate) {
    return <div className={className}>{bubble}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: role === 'user' ? 20 : 24, scale: role === 'user' ? 0.99 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: role === 'user' ? 0.62 : 0.72, ease: ENTRY_EASE }}
    >
      {bubble}
    </motion.div>
  );
}
