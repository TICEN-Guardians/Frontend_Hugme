import { useEffect, useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import Button from '../../common/Button/Button.jsx';
import Modal from '../../common/Modal/Modal.jsx';
import styles from './OcrConfirmModal.module.css';

const HOUSING_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: '아파트' },
  { value: 'OFFICETEL', label: '오피스텔 (주거용)' },
  { value: 'VILLA', label: '빌라·다세대·연립주택' },
  { value: 'HOUSE', label: '단독·다가구주택' },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'NEW', label: '신규계약' },
  { value: 'RENEWAL', label: '갱신계약' },
];

const PARTY_TYPE_OPTIONS = [
  { value: 'PERSON', label: '개인' },
  { value: 'COMPANY', label: '법인' },
];

const FIXED_DATE_STATUS_OPTIONS = [
  { value: true, label: '받음' },
  { value: false, label: '못 받음' },
];

const YES_NO_OPTIONS = [
  { value: true, label: '있음' },
  { value: false, label: '없음' },
];

const PROXY_CONTRACT_OPTIONS = [
  { value: false, label: '아님 (본인 계약)' },
  { value: true, label: '맞음 (대리인 계약)' },
];

function toBoolean(value) {
  return value === true || value === 'true' || value === 'YES';
}

function normalizeInfo(info) {
  if (!info) return null;

  return {
    ...info,
    housingTypeCode: info.housingTypeCode ?? info.housingType ?? 'APARTMENT',
    tenantType: info.tenantType === 'INDIVIDUAL' ? 'PERSON' : info.tenantType,
    landlordType: info.landlordType === 'INDIVIDUAL' ? 'PERSON' : info.landlordType,
    fixedDateConfirmed: toBoolean(
      info.fixedDateConfirmed ?? (info.fixedDateStatus === 'RECEIVED'),
    ),
    officetelResidentialMarked: toBoolean(
      info.officetelResidentialMarked ?? info.officetelResidential,
    ),
    landlordProxyContract: toBoolean(info.landlordProxyContract),
  };
}

export default function OcrConfirmModal({ isOpen, onClose, initialInfo, onConfirm, isSubmitting }) {
  const [form, setForm] = useState(() => normalizeInfo(initialInfo));

  useEffect(() => {
    setForm(normalizeInfo(initialInfo));
  }, [initialInfo]);

  if (!form) return null;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooleanChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value === 'true' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm({
      housingTypeCode: form.housingTypeCode,
      contractAddress: form.contractAddress,
      contractType: form.contractType,
      tenantType: form.tenantType,
      landlordType: form.landlordType,
      fixedDateConfirmed: form.fixedDateConfirmed,
      officetelResidentialMarked: form.officetelResidentialMarked,
      landlordProxyContract: form.landlordProxyContract,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName={styles.modalPanel}>
      <form className={styles.form} onSubmit={handleSubmit}>
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
            <label className={styles.label} htmlFor="ocr-housingTypeCode">
              주택유형
            </label>
            <select
              id="ocr-housingTypeCode"
              className={styles.select}
              value={form.housingTypeCode}
              onChange={handleChange('housingTypeCode')}
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
                value={String(form.fixedDateConfirmed)}
                onChange={handleBooleanChange('fixedDateConfirmed')}
                aria-label="확정일자 확인 여부"
              >
                {FIXED_DATE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ocr-officetelResidentialMarked">
              오피스텔 주거용 표기
            </label>
            <select
              id="ocr-officetelResidentialMarked"
              className={styles.select}
              value={String(form.officetelResidentialMarked)}
              onChange={handleBooleanChange('officetelResidentialMarked')}
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
              value={String(form.landlordProxyContract)}
              onChange={handleBooleanChange('landlordProxyContract')}
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
