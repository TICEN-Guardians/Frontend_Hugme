import { useRef, useState } from 'react';
import { FaArrowUpFromBracket, FaDownload, FaEye, FaTrash } from 'react-icons/fa6';
import Modal from '../../../../components/common/Modal/Modal.jsx';
import styles from './DocumentUploadActions.module.css';

const ACCEPT = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function DocumentUploadActions({
  document,
  uploads,
  isUploading,
  busyUploadId,
  onUpload,
  onPreview,
  onDownload,
  onDelete,
}) {
  const inputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const latestUpload = uploads[0] ?? null;
  const isBusy = latestUpload != null && busyUploadId === latestUpload.uploadId;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const supportedType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    if (!supportedType) {
      window.alert('PDF, JPG, PNG 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      window.alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      await onUpload(document.documentId, file);
    } catch {
      // 서버 오류는 서류 목록 상단의 오류 메시지로 표시한다.
    }
  };

  return (
    <div className={styles.root} onClick={(event) => event.stopPropagation()}>
      {!latestUpload && (
        <button
          type="button"
          className={`${styles.iconButton} ${styles.uploadButton}`}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-label={`${document.documentName} 업로드`}
          title={isUploading ? '업로드 중...' : '서류 업로드'}
        >
          <FaArrowUpFromBracket aria-hidden="true" />
        </button>
      )}
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
      />

      {latestUpload && (
        <>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onPreview(latestUpload.uploadId)}
            disabled={isBusy}
            aria-label={`${latestUpload.userFileName} 미리보기`}
            title="미리보기"
          >
            <FaEye aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onDownload(latestUpload.uploadId)}
            disabled={isBusy}
            aria-label={`${latestUpload.userFileName} 다운로드`}
            title="다운로드"
          >
            <FaDownload aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={() => setDeleteTarget(latestUpload)}
            disabled={isBusy}
            aria-label={`${latestUpload.userFileName} 삭제`}
            title="삭제"
          >
            <FaTrash aria-hidden="true" />
          </button>
        </>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isBusy) setDeleteTarget(null);
        }}
        panelClassName={styles.deleteModal}
      >
        <div className={styles.deleteModalIcon} aria-hidden="true"><FaTrash /></div>
        <h2 className={styles.deleteModalTitle}>업로드한 서류를 삭제할까요?</h2>
        <p className={styles.deleteModalDescription}>삭제한 파일은 복구할 수 없습니다.</p>
        <p className={styles.deleteFileName}>{deleteTarget?.userFileName}</p>
        <div className={styles.deleteModalActions}>
          <button
            type="button"
            className={styles.cancelAction}
            onClick={() => setDeleteTarget(null)}
            disabled={isBusy}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.confirmDeleteAction}
            onClick={async () => {
              if (!deleteTarget) return;
              await onDelete(deleteTarget.uploadId);
              setDeleteTarget(null);
            }}
            disabled={isBusy}
          >
            {isBusy ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
