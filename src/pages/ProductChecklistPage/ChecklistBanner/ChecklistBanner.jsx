import { useRef, useState } from 'react';
import { FaFileLines } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../../components/common/Button/Button.jsx';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import styles from './ChecklistBanner.module.css';

// 계약서는 PDF 스캔본이나 사진으로 올라온다고 가정. 명세에 없어서 임의 판단.
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPT_ATTR = 'application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB, 명세에 없어서 임의 값

export default function ChecklistBanner({ onFileSelected }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  const handleUploadClick = () => {
    setFileError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    // 같은 파일을 다시 선택해도 onChange가 발동하도록 매번 비워둔다.
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('PDF 또는 이미지 파일(JPG, PNG)만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('파일 용량은 20MB를 넘을 수 없어요.');
      return;
    }

    setFileError('');
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
              <p className={styles.title}>임대차계약서를 등록하고 맞춤 서류를 확인하세요</p>
              <p className={styles.description}>계약서를 분석하면 내 계약에 필요한 추가 서류를 확인할 수 있어요.</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          <Button type="button" onClick={handleUploadClick} style={{ flexShrink: 0 }}>
            계약서 업로드
          </Button>
        </div>
        {fileError && <p className={styles.fileError}>{fileError}</p>}
      </div>
    );
  }

  return (
    <div className={`${styles.banner} ${styles.loginBanner}`}>
      <div>
        <p className={styles.title}>로그인하면 내 계약서로 맞춤 확인할 수 있어요</p>
        <p className={styles.description}>
          임대차계약서를 바탕으로 내 계약에 필요한 서류를 확인할 수 있어요.
        </p>
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
