import { useEffect, useState } from 'react';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './KakaoNotificationModal.module.css';

const EMPTY_DATES = {
  contractStartDate: '',
  contractEndDate: '',
  balancePaymentDate: '',
  moveInDate: '',
};

export default function KakaoNotificationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [dates, setDates] = useState(EMPTY_DATES);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDates(EMPTY_DATES);
    setValidationError('');
  }, [isOpen]);

  const handleChange = (field) => (event) => {
    setDates((current) => ({ ...current, [field]: event.target.value }));
    setValidationError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (Object.values(dates).some((value) => !value)) {
      setValidationError('계약 날짜를 모두 입력해 주세요.');
      return;
    }

    if (dates.contractEndDate < dates.contractStartDate) {
      setValidationError('계약 종료일은 계약 시작일보다 빠를 수 없습니다.');
      return;
    }

    onSubmit(dates);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName={styles.modalPanel}>
      <form onSubmit={handleSubmit}>
        <p className={styles.eyebrow}>카카오톡 알림</p>
        <h2 className={styles.title}>신청기한 계산에 필요한 날짜를 입력해 주세요</h2>
        <p className={styles.description}>
          입력한 날짜로 보증 신청기한을 계산한 뒤 내 카카오톡으로 전송해요.
        </p>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>계약 시작일</span>
            <input
              type="date"
              value={dates.contractStartDate}
              onChange={handleChange('contractStartDate')}
              required
            />
          </label>
          <label className={styles.field}>
            <span>계약 종료일</span>
            <input
              type="date"
              value={dates.contractEndDate}
              onChange={handleChange('contractEndDate')}
              required
            />
          </label>
          <label className={styles.field}>
            <span>잔금 지급일</span>
            <input
              type="date"
              value={dates.balancePaymentDate}
              onChange={handleChange('balancePaymentDate')}
              required
            />
          </label>
          <label className={styles.field}>
            <span>전입 신고일</span>
            <input
              type="date"
              value={dates.moveInDate}
              onChange={handleChange('moveInDate')}
              required
            />
          </label>
        </div>

        {(validationError || error) && (
          <p className={styles.error} role="alert">
            {validationError || error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting} className={styles.kakaoButton}>
            {isSubmitting ? '카카오 연결 중...' : '카카오톡으로 보내기'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
