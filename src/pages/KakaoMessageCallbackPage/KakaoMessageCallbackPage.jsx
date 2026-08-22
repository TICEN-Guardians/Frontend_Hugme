import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  KAKAO_NOTIFICATION_PENDING_KEY,
  markKakaoNotificationAsSent,
  sendKakaoNotification,
} from '../../api/notification/notificationService.js';
import styles from './KakaoMessageCallbackPage.module.css';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

function readPendingNotification() {
  const saved = sessionStorage.getItem(KAKAO_NOTIFICATION_PENDING_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function formatDDay(dDay) {
  if (dDay > 0) return `D-${dDay}`;
  if (dDay === 0) return 'D-Day';
  return `D+${Math.abs(dDay)}`;
}

export default function KakaoMessageCallbackPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const kakaoError = searchParams.get('error');
  const kakaoErrorDescription = searchParams.get('error_description');
  const requestedKeyRef = useRef(null);
  const pending = readPendingNotification();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('카카오톡 알림을 전송하고 있어요.');
  const [returnTo, setReturnTo] = useState(
    pending?.returnTo ?? '/guarantee-checklist',
  );

  useEffect(() => {
    const requestKey = `${code ?? ''}:${state ?? ''}:${kakaoError ?? ''}`;
    if (requestedKeyRef.current === requestKey) return;
    requestedKeyRef.current = requestKey;

    const savedRequest = readPendingNotification();
    if (savedRequest?.returnTo) {
      setReturnTo(savedRequest.returnTo);
    }

    if (kakaoError) {
      sessionStorage.removeItem(KAKAO_NOTIFICATION_PENDING_KEY);
      setStatus(STATUS.ERROR);
      setMessage(
        kakaoErrorDescription ?? '카카오톡 메시지 권한 동의가 취소되었습니다.',
      );
      return;
    }

    if (!code || !state) {
      sessionStorage.removeItem(KAKAO_NOTIFICATION_PENDING_KEY);
      setStatus(STATUS.ERROR);
      setMessage('카카오 인증 결과가 올바르지 않습니다. 다시 시도해 주세요.');
      return;
    }

    if (!savedRequest?.applicationId) {
      setStatus(STATUS.ERROR);
      setMessage('전송할 신청 정보를 찾지 못했습니다. 준비서류 화면에서 다시 시도해 주세요.');
      return;
    }

    setStatus(STATUS.LOADING);
    sendKakaoNotification(savedRequest.applicationId, {
      code,
      state,
      contractStartDate: savedRequest.contractStartDate,
      contractEndDate: savedRequest.contractEndDate,
      balancePaymentDate: savedRequest.balancePaymentDate,
      moveInDate: savedRequest.moveInDate,
    })
      .then((response) => {
        markKakaoNotificationAsSent(savedRequest.applicationId);
        sessionStorage.removeItem(KAKAO_NOTIFICATION_PENDING_KEY);
        setStatus(STATUS.SUCCESS);
        setMessage(
          `신청기한 ${response.applicationDeadline} (${formatDDay(response.dDay)}) 알림을 내 카카오톡으로 보냈습니다.`,
        );
      })
      .catch((error) => {
        sessionStorage.removeItem(KAKAO_NOTIFICATION_PENDING_KEY);
        setStatus(STATUS.ERROR);
        setMessage(
          error?.response?.data?.message ??
            '카카오톡 알림을 보내지 못했습니다. 준비서류 화면에서 다시 시도해 주세요.',
        );
      });
  }, [code, state, kakaoError, kakaoErrorDescription]);

  const isLoading = status === STATUS.LOADING;
  const isSuccess = status === STATUS.SUCCESS;

  return (
    <div className={styles.root}>
      <section className={styles.panel} data-status={status}>
        <div className={styles.statusIcon} aria-hidden="true">
          {isLoading ? '...' : isSuccess ? '✓' : '!'}
        </div>
        <p className={styles.eyebrow}>카카오톡 알림</p>
        <h1 className={styles.title}>
          {isLoading ? '알림 전송 중' : isSuccess ? '알림 전송 완료' : '알림 전송 실패'}
        </h1>
        <p className={styles.description}>{message}</p>

        {!isLoading && (
          <Link to={returnTo} replace className={styles.actionLink}>
            준비서류 화면으로 돌아가기
          </Link>
        )}
      </section>
    </div>
  );
}
