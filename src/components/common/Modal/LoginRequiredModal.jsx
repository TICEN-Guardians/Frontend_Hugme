import { FiLock } from 'react-icons/fi';
import Modal from './Modal.jsx';
import styles from './LoginRequiredModal.module.css';

export default function LoginRequiredModal({
  isOpen,
  description = '로그인이 필요한 기능이에요. 로그인 하시겠어요?',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className={styles.wrap}>
        <div className={styles.iconWrap}>
          <FiLock aria-hidden="true" />
        </div>
        <h2 className={styles.title}>로그인이 필요해요</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            취소
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm}>
            로그인하기
          </button>
        </div>
      </div>
    </Modal>
  );
}
