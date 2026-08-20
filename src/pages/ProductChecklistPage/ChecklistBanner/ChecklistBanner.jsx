import { useRef, useState } from 'react';
import { FaFileLines } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../../components/common/Button/Button.jsx';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import styles from './ChecklistBanner.module.css';

const ACCEPT_ATTR = 'image/*';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB, 명세에 없어서 임의 값

export default function ChecklistBanner({ onFileSelected, onBeforeUpload, isPreparingUpload = false }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  const handleUploadClick = () => {
    setFileError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] ?? null;
    // 같은 파일을 다시 선택해도 onChange가 발동하도록 매번 비워둔다.
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('파일 용량은 20MB를 넘을 수 없어요.');
      return;
    }

    setFileError('');

    const shouldUpload = onBeforeUpload
      ? await onBeforeUpload()
      : true;

    if (!shouldUpload) return;
    onFileSelected(file);
  };

  if (isAuthLoading) {
    return <div className={`${styles.banner} ${styles.skeleton}`} aria-hidden="true" />;
  }

  if (isAuthenticated) {
    return (
      <div>
        <div className={`${styles.banner} ${styles.uploadBanner}`}>
          <div className={styles.content}>
            <span className={styles.icon}>
              <FaFileLines aria-hidden="true" />
            </span>
            <div>
              <p className={styles.title}>내 계약에 맞춰 보기</p>
              <p className={styles.description}>
                임대차계약서를 분석하면 내 상황에 맞는 준비서류를 확인할 수 있어요.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={isPreparingUpload}
            className={styles.uploadButton}
          >
            {isPreparingUpload ? '기존 내역 확인 중...' : '계약서 업로드'}
          </Button>
        </div>
        {fileError && <p className={styles.fileError}>{fileError}</p>}
      </div>
    );
  }

  return (
    <div className={`${styles.banner} ${styles.loginBanner}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          <FaFileLines aria-hidden="true" />
        </span>
        <div>
        <p className={styles.title}>로그인하면 맞춤 확인 가능</p>
        <p className={styles.description}>
          임대차계약서를 바탕으로 필요한 서류를 확인할 수 있어요.
        </p>
        </div>
      </div>
      <Link
        to="/auth/login"
        state={{ from: location }}
        className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.cta}`}
      >
        로그인하기
      </Link>
    </div>
  );
}
