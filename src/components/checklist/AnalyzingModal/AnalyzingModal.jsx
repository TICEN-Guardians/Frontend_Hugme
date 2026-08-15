import Modal from '../../common/Modal/Modal.jsx';
import styles from './AnalyzingModal.module.css';

export default function AnalyzingModal({ isOpen }) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div className={styles.content}>
        <span className={styles.spinner} aria-hidden="true" />
        <div>
          <p className={styles.title}>임대차계약서 분석 중...</p>
          <p className={styles.description}>OCR로 계약 정보를 읽고 있어요.</p>
        </div>
      </div>
    </Modal>
  );
}
