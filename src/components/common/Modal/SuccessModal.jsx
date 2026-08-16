import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Modal from './Modal.jsx';
import styles from './SuccessModal.module.css';

export default function SuccessModal({
  isOpen,
  tone = 'success',
  title,
  description,
  actionLabel = '확인',
  onAction,
  onClose,
}) {
  const handleClose = onClose ?? onAction;
  const Icon = tone === 'error' ? FiAlertCircle : FiCheckCircle;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.success}>
        <div className={`${styles.iconWrap} ${tone === 'error' ? styles.errorIconWrap : ''}`}>
          <Icon aria-hidden="true" />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <button type="button" className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </Modal>
  );
}
