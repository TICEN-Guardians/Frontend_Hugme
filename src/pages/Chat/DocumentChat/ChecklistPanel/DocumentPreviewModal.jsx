import Modal from '../../../../components/common/Modal/Modal.jsx';
import styles from './DocumentPreviewModal.module.css';

export default function DocumentPreviewModal({ preview, onClose }) {
  const isImage = preview?.mimeType?.startsWith('image/');

  return (
    <Modal
      isOpen={Boolean(preview)}
      onClose={onClose}
      panelClassName={styles.panel}
    >
      <div className={styles.header}>
        <p className={styles.eyebrow}>서류 미리보기</p>
        <h2 className={styles.title}>{preview?.fileName}</h2>
      </div>
      <div className={styles.viewer}>
        {preview && (isImage ? (
          <img src={preview.url} alt={`${preview.fileName} 미리보기`} />
        ) : (
          <iframe src={preview.url} title={`${preview.fileName} 미리보기`} />
        ))}
      </div>
    </Modal>
  );
}
