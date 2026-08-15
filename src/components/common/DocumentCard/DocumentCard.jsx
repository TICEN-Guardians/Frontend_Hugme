import Chip from '../Chip/Chip.jsx';
import StatusBadge from '../StatusBadge/StatusBadge.jsx';
import styles from './DocumentCard.module.css';

export default function DocumentCard({ icon, title, description, chip, status, expanded, onClick }) {
  const content = (
    <>
      <div className={styles.head}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.title}>{title}</span>
        {expanded !== undefined && (
          <span
            className={`${styles.arrow} ${expanded ? styles.arrowExpanded : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        )}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {(chip || status) && (
        <div className={styles.meta}>
          {chip && <Chip>{chip}</Chip>}
          {status && <StatusBadge label={status.label} tone={status.tone} />}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.card} ${styles.clickable}`}
        onClick={onClick}
        aria-expanded={expanded}
      >
        {content}
      </button>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
