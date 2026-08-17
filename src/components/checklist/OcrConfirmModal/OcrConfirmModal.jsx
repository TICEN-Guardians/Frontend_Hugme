import { useEffect, useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './OcrConfirmModal.module.css';

const HOUSING_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: '아파트' },
  { value: 'OFFICETEL', label: '오피스텔 (주거용)' },
  { value: 'MULTI_FAMILY', label: '다세대주택' },
  { value: 'SINGLE_FAMILY', label: '단독주택' },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'NEW', label: '신규계약' },
  { value: 'RENEWAL', label: '갱신계약' },
];

const PARTY_TYPE_OPTIONS = [
  { value: 'PERSON', label: '개인' },
  { value: 'CORPORATION', label: '법인' },
];

const FIXED_DATE_STATUS_OPTIONS = [
  { value: 'RECEIVED', label: '받음' },
  { value: 'NOT_RECEIVED', label: '못 받음' },
];

const YES_NO_OPTIONS = [
  { value: 'YES', label: '있음' },
  { value: 'NO', label: '없음' },
];

const PROXY_CONTRACT_OPTIONS = [
  { value: 'NO', label: '아님 (본인 계약)' },
  { value: 'YES', label: '맞음 (대리인 계약)' },
];

export default function OcrConfirmModal({ isOpen, onClose, initialInfo, onConfirm, isSubmitting }) {
  const [form, setForm] = useState(initialInfo);

  useEffect(() => {
    setForm(initialInfo);
  }, [initialInfo]);

  if (!form) return null;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={styles.headerRow}>
          <span className={styles.badge}>
            <FaCircleCheck aria-hidden="true" /> 분석 완료
          </span>
          <span className={styles.headerNote}>계약서에서 읽어온 정보예요</span>
        </div>

        <h2 className={styles.title}>계약 정보를 확인해 주세요</h2>
        <p className={styles.subtitle}>
          이 정보로 낼 서류가 정해져요. <strong>잘못 읽은 값이 있으면 수정</strong>해 주세요.
        </p>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-contractAddress">
              계약 주소
            </label>
            <input
              id="ocr-contractAddress"
              type="text"
              className={styles.input}
              value={form.contractAddress ?? ''}
              onChange={handleChange('contractAddress')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-housingType">
              주택유형
            </label>
            <select
              id="ocr-housingType"
              className={styles.select}
              value={form.housingType ?? ''}
              onChange={handleChange('housingType')}
            >
              {HOUSING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-contractType">
              신규·갱신 여부
            </label>
            <select
              id="ocr-contractType"
              className={styles.select}
              value={form.contractType ?? ''}
              onChange={handleChange('contractType')}
            >
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-tenantType">
              임차인 개인·법인
            </label>
            <select
              id="ocr-tenantType"
              className={styles.select}
              value={form.tenantType ?? ''}
              onChange={handleChange('tenantType')}
            >
              {PARTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-landlordType">
              임대인 개인·법인
            </label>
            <select
              id="ocr-landlordType"
              className={styles.select}
              value={form.landlordType ?? ''}
              onChange={handleChange('landlordType')}
            >
              {PARTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>확정일자 확인 여부</span>
            <div className={styles.inlineRow}>
              <select
                className={styles.select}
                value={form.fixedDateStatus ?? ''}
                onChange={handleChange('fixedDateStatus')}
                aria-label="확정일자 확인 여부"
              >
                {FIXED_DATE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className={styles.input}
                value={form.fixedDate ?? ''}
                onChange={handleChange('fixedDate')}
                aria-label="확정일자"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-officetelResidential">
              오피스텔 주거용 표기
            </label>
            <select
              id="ocr-officetelResidential"
              className={styles.select}
              value={form.officetelResidential ?? ''}
              onChange={handleChange('officetelResidential')}
            >
              {YES_NO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-landlordProxyContract">
              임대인 대리계약 여부
            </label>
            <select
              id="ocr-landlordProxyContract"
              className={styles.select}
              value={form.landlordProxyContract ?? ''}
              onChange={handleChange('landlordProxyContract')}
            >
              {PROXY_CONTRACT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerNote}>확인이 끝나면 3단계 질문으로 서류가 확정돼요.</p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '다음'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
