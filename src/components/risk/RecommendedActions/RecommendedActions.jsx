import { FiCheckCircle } from 'react-icons/fi';
import styles from './RecommendedActions.module.css';

export default function RecommendedActions({ title, actions }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {actions.map((action, index) => (
          <div key={action.title} className={styles.row}>
            <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
            <div className={styles.content}>
              <p className={styles.actionTitle}>
                {action.icon ?? <FiCheckCircle aria-hidden="true" />}
                {action.title}
              </p>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
