import { useRef, useState } from 'react';
import { FaFileLines, FaListCheck } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../../components/common/Button/Button.jsx';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import { useAuth } from '../../../context/auth/AuthContext.jsx';
import styles from './ChecklistBanner.module.css';

const ACCEPT_ATTR = 'image/*';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB, 명세에 없어서 임의 값

export default function ChecklistBanner({
  onFileSelected,
  onBeforeUpload,
  isPreparingUpload = false,
  onPrepareTest,
  isPreparingTest = false,
}) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  const handleUploadClick = async () => {
    setFileError('');

    const shouldOpenFilePicker = onBeforeUpload
      ? await onBeforeUpload()
      : true;

    if (!shouldOpenFilePicker) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
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
    onFileSelected(file);
  };

  if (isAuthLoading) {
    return <div className={`${styles.selectionPanel} ${styles.skeleton}`} aria-hidden="true" />;
  }

  return (
    <section className={styles.selectionPanel}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>맞춤 준비서류 확인</p>
        <h2 className={styles.headingTitle}>어떤 방식으로 확인할까요?</h2>
        <p className={styles.headingDescription}>
          계약서를 분석하거나 조건을 직접 선택해 예상 준비서류를 확인할 수 있어요.
        </p>
      </div>

      <div className={styles.choiceGrid}>
        <article className={styles.choiceCard}>
          <span className={styles.icon}>
            <FaListCheck aria-hidden="true" />
          </span>
          <h3 className={styles.title}>계약서 없이 미리 확인</h3>
          <p className={styles.description}>
            계약 조건을 직접 선택해 예상 준비서류를 간편하게 확인해요.
          </p>
          <p className={styles.requirement}>로그인 없이 이용 가능</p>
          <Button
            type="button"
            variant="secondary"
            onClick={onPrepareTest}
            disabled={isPreparingTest}
            className={styles.choiceButton}
          >
            {isPreparingTest ? '모의테스트 준비 중...' : '모의테스트 진행하기'}
          </Button>
        </article>

        <article className={styles.choiceCard}>
          <span className={styles.icon}>
            <FaFileLines aria-hidden="true" />
          </span>
          <h3 className={styles.title}>내 계약에 맞춰 보기</h3>
          <p className={styles.description}>
            임대차계약서를 분석해 내 상황에 맞는 준비서류를 정확하게 확인해요.
          </p>
          <p className={styles.requirement}>로그인 및 임대차계약서 이미지 필요</p>

          {isAuthenticated ? (
            <>
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
                className={styles.choiceButton}
              >
                {isPreparingUpload ? '기존 내역 확인 중...' : '계약서 업로드'}
              </Button>
            </>
          ) : (
            <Link
              to="/auth/login"
              state={{ from: location }}
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.choiceButton}`}
            >
              로그인하기
            </Link>
          )}
          {fileError && <p className={styles.fileError}>{fileError}</p>}
        </article>
      </div>
    </section>
  );
}
