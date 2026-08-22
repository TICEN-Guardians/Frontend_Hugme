import { useRef } from 'react';
import { FaArrowUpFromBracket, FaDownload, FaEye, FaTrash } from 'react-icons/fa6';
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
            onClick={() => {
              if (window.confirm(`‘${latestUpload.userFileName}’ 파일을 삭제할까요?`)) {
                onDelete(latestUpload.uploadId);
              }
            }}
            disabled={isBusy}
            aria-label={`${latestUpload.userFileName} 삭제`}
            title="삭제"
          >
            <FaTrash aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
