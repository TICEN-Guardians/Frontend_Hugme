import { FaCircleInfo } from 'react-icons/fa6';
import styles from './RecommendedActions.module.css';

export default function RecommendedActions({ title, actions }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>
        {title} <FaCircleInfo aria-hidden="true" />
      </p>
      <div className={styles.list}>
        {actions.map((action) => (
          <div key={action.title} className={styles.row}>
            <span className={styles.icon}>{action.icon}</span>
            <div className={styles.content}>
              <p className={styles.actionTitle}>{action.title}</p>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
