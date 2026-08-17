import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaArrowUp, FaCircleCheck, FaCircleInfo } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import styles from './RiskFormPage.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, Design 기준
const ACCEPTED_TYPE = 'application/pdf';
const ENTRY_EASE = [0.16, 1, 0.3, 1];

// 실제 리포트 조회 API가 없어서, 제출 성공 시 고정 reportId로 이동한다.
const FIXED_REPORT_ID = 'sample';

export default function RiskFormPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef(null);

  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [area, setArea] = useState('');
  const [deposit, setDeposit] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 실제 주소 조회 API가 없어서, 주소를 입력하면 데모용으로 고정된 주택유형을 보여준다.
  const detectedHousingType = address.trim() ? '단독·다가구' : null;

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!picked) return;

    if (picked.type !== ACCEPTED_TYPE) {
      setFileError('PDF 파일만 업로드할 수 있어요.');
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      setFileError('파일 용량은 10MB를 넘을 수 없어요.');
      return;
    }
    setFileError('');
    setFile(picked);
  };

  const validate = () => {
    const nextErrors = {};
    if (!address.trim()) nextErrors.address = '주소를 입력해주세요.';
    if (!addressDetail.trim()) nextErrors.addressDetail = '상세 주소를 입력해주세요.';
    if (!area.trim()) nextErrors.area = '면적을 입력해주세요.';
    if (!deposit.trim()) nextErrors.deposit = '전세보증금을 입력해주세요.';
    if (!contractDate.trim()) nextErrors.contractDate = '계약 예정일을 입력해주세요.';
    if (!file) nextErrors.file = '등기부등본 파일을 업로드해주세요.';
    if (!agreed) nextErrors.agreed = '서비스 이용에 동의해주세요.';
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    // API 없음 — 실제 호출 없이 고정 reportId로 이동
    navigate(`/risk/${FIXED_REPORT_ID}`);
  };

  return (
    <div className={styles.root}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <motion.header
          className={styles.hero}
          initial={{
            opacity: 0,
            y: prefersReducedMotion ? 0 : 34,
            scale: prefersReducedMotion ? 1 : 0.988,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.35 : 1.05, delay: 0.08, ease: ENTRY_EASE }}
        >
          <span className={styles.heroBadge}>HUGME 위험도 진단</span>
          <h1 className={styles.title}>매물 위험도 진단</h1>
          <p className={styles.subtitle}>
            계약 전 매물 정보를 입력하고 등기부등본을 첨부해 위험 요소를 확인하세요.
          </p>
        </motion.header>

        <motion.div
          className={styles.card}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.14,
                delayChildren: prefersReducedMotion ? 0 : 0.18,
              },
            },
          }}
        >
          <motion.div
            className={styles.primaryColumn}
            variants={{
              hidden: {
                opacity: 0,
                y: prefersReducedMotion ? 0 : 28,
                scale: prefersReducedMotion ? 1 : 0.988,
              },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -3,
                    boxShadow: '0 1.4rem 3.8rem rgba(15, 23, 42, 0.08)',
                  }
            }
            transition={{ duration: prefersReducedMotion ? 0.35 : 0.95, ease: ENTRY_EASE }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="risk-address">
                주소 <span className={styles.required}>•</span>
              </label>
              <div className={styles.inlineRow}>
                <input
                  id="risk-address"
                  type="text"
                  className={styles.input}
                  placeholder="도로명, 지번, 건물명 등으로 검색하세요"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <button type="button" className={styles.searchButton}>
                  주소 검색
                </button>
              </div>
              {errors.address && <p className={styles.fieldError}>{errors.address}</p>}

              <input
                type="text"
                className={styles.input}
                placeholder="상세 주소(동/호수)를 입력하세요"
                value={addressDetail}
                onChange={(event) => setAddressDetail(event.target.value)}
              />
              {errors.addressDetail && <p className={styles.fieldError}>{errors.addressDetail}</p>}

              {detectedHousingType && (
                <div className={styles.housingTypeBox}>
                  <span className={styles.housingTypeInfo}>
                    <span className={styles.infoIcon}>
                      <FaCircleInfo aria-hidden="true" />
                    </span>
                    확인된 주택유형 · {detectedHousingType}
                  </span>
                  <span className={styles.housingTypeConfirmed}>
                    <FaCircleCheck aria-hidden="true" /> 주소 확인 완료
                  </span>
                </div>
              )}
            </div>

            <div className={styles.twoColumnFields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="risk-area">
                  계약 면적 <span className={styles.required}>•</span>
                </label>
                <div className={styles.unitInputWrapper}>
                  <input
                    id="risk-area"
                    type="text"
                    inputMode="decimal"
                    className={styles.unitInput}
                    placeholder="예) 33.12"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                  />
                  <span className={styles.unit}>m²</span>
                </div>
                {errors.area && <p className={styles.fieldError}>{errors.area}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="risk-deposit">
                  전세보증금 <span className={styles.required}>•</span>
                </label>
                <div className={styles.unitInputWrapper}>
                  <input
                    id="risk-deposit"
                    type="text"
                    inputMode="numeric"
                    className={styles.unitInput}
                    placeholder="예: 200000000"
                    value={deposit}
                    onChange={(event) => setDeposit(event.target.value)}
                  />
                  <span className={styles.unit}>원</span>
                </div>
                {errors.deposit && <p className={styles.fieldError}>{errors.deposit}</p>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="risk-contract-date">
                계약 예정일 <span className={styles.required}>•</span>
              </label>
              <div className={styles.unitInputWrapper}>
                <input
                  id="risk-contract-date"
                  type="date"
                  className={styles.unitInput}
                  value={contractDate}
                  onChange={(event) => setContractDate(event.target.value)}
                />
              </div>
              {errors.contractDate && <p className={styles.fieldError}>{errors.contractDate}</p>}
            </div>
          </motion.div>

          <motion.div
            className={styles.sideColumn}
            variants={{
              hidden: {
                opacity: 0,
                y: prefersReducedMotion ? 0 : 28,
                scale: prefersReducedMotion ? 1 : 0.988,
              },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -3,
                    boxShadow: '0 1.4rem 3.8rem rgba(15, 23, 42, 0.08)',
                  }
            }
            transition={{ duration: prefersReducedMotion ? 0.35 : 0.95, ease: ENTRY_EASE }}
          >
            <div className={styles.field}>
              <span className={styles.label}>
                등기부등본 파일 <span className={styles.required}>•</span>
              </span>
              <div className={styles.dropzone}>
                <div className={styles.dropzoneInfo}>
                  <span className={styles.uploadIcon}>
                    <FaArrowUp aria-hidden="true" />
                  </span>
                  <div>
                    <p className={styles.dropzoneTitle}>
                      {file ? file.name : 'PDF 파일 업로드'}
                    </p>
                    <p className={styles.dropzoneDescription}>
                      PDF · 최대 10MB · 최근 1개월 이내 발급본 권장
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPE}
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                />
                <button type="button" className={styles.fileSelectButton} onClick={handleFilePick}>
                  파일 선택
                </button>
              </div>
              {fileError && <p className={styles.fieldError}>{fileError}</p>}
              {errors.file && <p className={styles.fieldError}>{errors.file}</p>}
            </div>

            <div className={styles.infoBanner}>
              <span className={styles.infoIcon}>
                <FaCircleInfo aria-hidden="true" />
              </span>
              <span>
                전용면적, 연면적, 대지면적, 대지권면적, 층수 등은 가능한 범위 내에서 자동 조회됩니다.
              </span>
            </div>

            <label className={styles.agreeRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <span>
                입력 정보가 실제 계약 조건과 일치함을 확인하고 서비스 이용에 동의합니다.{' '}
                <span className={styles.agreeLink}>자세히 보기</span>
              </span>
            </label>
            {errors.agreed && <p className={styles.fieldError}>{errors.agreed}</p>}
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.actionRow}
          initial={{
            opacity: 0,
            y: prefersReducedMotion ? 0 : 18,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.35 : 0.82, delay: 0.42, ease: ENTRY_EASE }}
        >
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? '진단 시작 중...' : '위험도 진단 시작하기'}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
