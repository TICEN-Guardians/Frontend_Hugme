import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyMail } from '../../api/auth/authService.js';
import AuthLayout from '../../layout/AuthLayout/AuthLayout.jsx';
import styles from './EmailVerifyPage.module.css';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const requestedTokenRef = useRef(null);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus(STATUS.ERROR);
      setMessage('인증 토큰이 없습니다. 이메일의 인증 링크를 다시 확인해주세요.');
      return;
    }

    if (requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;

    setStatus(STATUS.LOADING);
    setMessage('');

    verifyMail(token)
      .then(() => {
        setStatus(STATUS.SUCCESS);
        setMessage('이메일 인증 및 회원가입이 완료되었습니다. 로그인해주세요.');
      })
      .catch((error) => {
        setStatus(STATUS.ERROR);
        setMessage(
          error?.response?.data?.message ??
            '이메일 인증에 실패했습니다. 인증 링크가 만료되었거나 올바르지 않을 수 있어요.',
        );
      });
  }, [token]);

  const isLoading = status === STATUS.LOADING;
  const isSuccess = status === STATUS.SUCCESS;

  return (
    <AuthLayout title="이메일 인증">
      <div className={styles.panel} data-status={status}>
        <div className={styles.statusIcon} aria-hidden="true">
          {isLoading ? '...' : isSuccess ? '✓' : '!'}
        </div>
        <h2 className={styles.title}>
          {isLoading ? '이메일 인증 확인 중' : isSuccess ? '회원가입 완료' : '인증 실패'}
        </h2>
        <p className={styles.description}>
          {isLoading ? '잠시만 기다려주세요. 인증 링크를 확인하고 있어요.' : message}
        </p>

        {!isLoading && (
          <Link to={isSuccess ? '/auth/login' : '/auth/signup'} className={styles.actionLink}>
            {isSuccess ? '로그인하러 가기' : '회원가입으로 돌아가기'}
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
