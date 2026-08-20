import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaArrowUp, FaCircleCheck, FaCircleInfo } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import { analyzeDiagnosis, createDiagnosis, resolveProperty, searchProperty, updateDiagnosisDetails, uploadRegistry } from '../../api/propertyRisk/propertyRiskService.js';
import { setLastRiskAnalysisId } from '../../utils/riskDiagnosisStorage.js';
import styles from './RiskFormPage.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPE = 'application/pdf';
const ENTRY_EASE = [0.16, 1, 0.3, 1];
const HOUSING_LABEL = { APARTMENT: '아파트', VILLA: '연립·다세대', OFFICETEL: '오피스텔', DETACHED_MULTI: '단독·다가구' };
const errorMessage = (error, fallback) => error?.response?.data?.message ?? error?.response?.data?.detail?.message ?? fallback;
const onlyDigits = (value) => value.replace(/\D/g, '');
const parseFloorInput = (value) => (String(value).trim() === '' ? null : Number(value));
const formatMoneyInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? Number(digits).toLocaleString('ko-KR') : '';
};
const PROGRESS_STEPS = [
  { key: 'resolve', label: '건물 정보 확인', description: '건축물 정보와 계약 대상 호수를 대조하고 있습니다.' },
  { key: 'save', label: '계약 정보 저장', description: '입력한 계약 조건을 진단 요청으로 준비하고 있습니다.' },
  { key: 'registry', label: '등기부등본 분석', description: '등기부등본에서 권리관계와 면적 정보를 확인하고 있습니다.' },
  { key: 'analyze', label: '위험도 계산', description: '시세와 담보 정보를 바탕으로 위험도를 계산하고 있습니다.' },
];

export default function RiskFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef(null);
  const contractDateInputRef = useRef(null);
  const pendingDiagnosisRef = useRef(null);
  const [address, setAddress] = useState('');
  const [normalizedAddress, setNormalizedAddress] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [addressCandidates, setAddressCandidates] = useState([]);
  const [resolvedProperty, setResolvedProperty] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [hoName, setHoName] = useState('');
  const [area, setArea] = useState('');
  const [floor, setFloor] = useState('');
  const [deposit, setDeposit] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isAreaRequiredModalOpen, setIsAreaRequiredModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressStep, setProgressStep] = useState('resolve');
  const [stage, setStage] = useState('registry');
  const [analysisId, setAnalysisId] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);

  const selectedCandidate = selectedIndex === '' ? null : candidates[Number(selectedIndex)];
  const housingType = selectedCandidate?.housingType ?? null;
  const contractAreaRequired = resolvedProperty?.contractAreaRequired ?? housingType === 'DETACHED_MULTI';
  // 단독·다가구는 집합건물이 아니라 '호'가 없고, 예측 모델에도 층 Feature가 없다.
  // 받아도 버려지는 값이라 입력칸을 아예 내리고 값도 보내지 않는다.
  // 아직 동을 고르지 않아 유형을 모를 때는 기존처럼 보여준다.
  const unitFieldsEnabled = housingType !== 'DETACHED_MULTI';

  const resetAddressResult = () => {
    setNormalizedAddress(''); setCandidates([]); setAddressCandidates([]); setSelectedIndex(''); setHoName(''); setResolvedProperty(null);
  };

  const runAddressSearch = async (keyword) => {
    if (!keyword) return setErrors((current) => ({ ...current, address: '주소를 입력해 주세요.' }));
    setIsSearching(true);
    setErrors((current) => ({ ...current, address: '', candidate: '' }));
    try {
      const result = await searchProperty(keyword);
      const nextAddresses = result.addressCandidates ?? [];
      if (nextAddresses.length) {
        setNormalizedAddress(''); setCandidates([]); setSelectedIndex(''); setResolvedProperty(null);
        setAddressCandidates(nextAddresses);
        return;
      }
      setAddressCandidates([]);
      const nextCandidates = result.candidates ?? [];
      setNormalizedAddress(result.normalizedAddress);
      setCandidates(nextCandidates);
      setSelectedIndex(nextCandidates.length === 1 ? '0' : '');
      if (!nextCandidates.length) setErrors((current) => ({ ...current, candidate: '선택 가능한 건축물대장 결과가 없습니다.' }));
    } catch (error) {
      resetAddressResult();
      setErrors((current) => ({ ...current, address: errorMessage(error, '주소 검색에 실패했습니다.') }));
    } finally { setIsSearching(false); }
  };

  const handleAddressSearch = () => runAddressSearch(address.trim());

  const handleAddressCandidateSelect = (roadAddress) => {
    setAddress(roadAddress);
    setAddressCandidates([]);
    runAddressSearch(roadAddress);
  };

  const handleFileChange = (event) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!picked) return;
    if (picked.type !== ACCEPTED_TYPE) return setFileError('PDF 파일만 업로드할 수 있습니다.');
    if (picked.size > MAX_FILE_SIZE) return setFileError('파일 용량은 10MB를 초과할 수 없습니다.');
    setFileError(''); setFile(picked);
  };

  const openContractDatePicker = () => {
    const input = contractDateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker(); else input.focus();
  };

  const setProgress = (step, message) => {
    setProgressStep(step);
    setProgressMessage(message);
  };

  const validateRegistry = () => {
    const next = {};
    if (addressCandidates.length) next.address = '검색된 주소 중 하나를 선택해 주세요.';
    else if (!address.trim() || !normalizedAddress) next.address = '주소 검색을 완료해 주세요.';
    if (!selectedCandidate) next.candidate = '진단할 건물 또는 동을 선택해 주세요.';
    if (unitFieldsEnabled) {
      const floorText = String(floor).trim();
      if (!hoName.trim()) next.hoName = '호수를 입력해 주세요.';
      if (floorText === '') next.floor = '해당 층을 입력해 주세요.';
      else if (!Number.isInteger(Number(floorText))) next.floor = '해당 층을 정수로 입력해 주세요.';
    }
    if (!landlordName.trim()) next.landlordName = '계약 상대방 이름을 입력해 주세요.';
    if (!deposit || Number(deposit.replaceAll(',', '')) <= 0) next.deposit = '보증금을 입력해 주세요.';
    if (!contractDate) next.contractDate = '계약 예정일을 입력해 주세요.';
    if (!file) next.file = '등기부등본 PDF를 업로드해 주세요.';
    if (!agreed) next.agreed = '서비스 이용에 동의해 주세요.';
    return next;
  };

  const validateDetails = () => {
    const next = {};
    if (!area || Number(area) <= 0) next.area = (contractAreaRequired ? '계약면적' : '전용면적') + '을 입력해 주세요.';
    return next;
  };

  const diagnosisDetails = (resolvedArea, useContractArea) => ({
    dongName: selectedCandidate.dongName || null,
    hoName: unitFieldsEnabled ? hoName.trim() : null,
    deposit: Number(deposit.replaceAll(',', '')),
    contractDate,
    contractArea: useContractArea ? Number(resolvedArea) : null,
    exclusiveArea: useContractArea ? null : Number(resolvedArea),
    floor: unitFieldsEnabled ? parseFloorInput(floor) : null,
    landlordName: landlordName.trim(),
  });

  const completeDiagnosis = async (targetAnalysisId, resolvedArea, resolved) => {
    const useContractArea = resolved?.contractAreaRequired ?? contractAreaRequired;
    await updateDiagnosisDetails(
      targetAnalysisId,
      diagnosisDetails(resolvedArea, useContractArea),
    );
    setProgress('analyze', '시세와 위험도를 계산하고 있습니다.');
    await analyzeDiagnosis(targetAnalysisId);
    setLastRiskAnalysisId(user?.email, targetAnalysisId);
    navigate('/risk/' + targetAnalysisId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = stage === 'registry' ? validateRegistry() : validateDetails();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setIsAreaRequiredModalOpen(false);
    let currentStep = stage === 'registry' ? '건물 정보를 확인' : '시세와 위험도를 계산';
    try {
      if (stage === 'registry') {
        setProgress('resolve', '건물과 소유자 정보를 확인하고 있습니다.');
        const resolved = await resolveProperty({
          address: address.trim(),
          dongName: selectedCandidate.dongName,
          hoName: unitFieldsEnabled ? hoName.trim() : null,
        });
        setResolvedProperty(resolved);
        currentStep = '계약 정보를 저장';
        setProgress('save', '입력한 계약 정보를 저장하고 있습니다.');
        // 진단 재사용 여부는 사용자가 입력한 값으로만 판단한다.
        // 매물 스냅샷은 같은 입력이면 항상 같은 값이라 키에 넣지 않는다.
        const contract = {
          address: address.trim(),
          dongName: selectedCandidate.dongName || null,
          hoName: unitFieldsEnabled ? hoName.trim() : null,
          deposit: Number(deposit.replaceAll(',', '')),
          contractDate,
          contractArea: null,
          exclusiveArea: null,
          floor: unitFieldsEnabled ? parseFloorInput(floor) : null,
          landlordName: landlordName.trim(),
        };
        const payloadKey = JSON.stringify(contract) + '|' + (file ? `${file.name}:${file.size}:${file.lastModified}` : '');
        const reusableAnalysisId = pendingDiagnosisRef.current?.payloadKey === payloadKey
          ? pendingDiagnosisRef.current.analysisId
          : null;
        const targetAnalysisId = reusableAnalysisId ?? (await createDiagnosis({
          ...contract,
          // 분석 단계에서 주소·건축물대장을 다시 조회하지 않도록 그대로 돌려준다.
          propertySnapshot: resolved?.propertySnapshot ?? null,
        })).analysisId;
        pendingDiagnosisRef.current = { analysisId: targetAnalysisId, payloadKey };
        currentStep = '등기부등본을 분석';
        setProgress('registry', '등기부등본에서 전용면적과 권리관계를 확인하고 있습니다.');
        const registry = await uploadRegistry({ analysisId: targetAnalysisId, file });
        pendingDiagnosisRef.current = null;
        setAnalysisId(targetAnalysisId);
        setOcrResult(registry);
        const useContractArea = resolved?.contractAreaRequired ?? contractAreaRequired;
        const ocrArea = useContractArea ? null : Number(registry.exclusiveArea);
        if (Number.isFinite(ocrArea) && ocrArea > 0) {
          currentStep = '시세와 위험도를 계산';
          await completeDiagnosis(targetAnalysisId, ocrArea, resolved);
          return;
        }
        setStage('details');
        setProgressMessage('');
        setIsAreaRequiredModalOpen(true);
      } else {
        setProgress('analyze', '시세와 위험도를 계산하고 있습니다.');
        await completeDiagnosis(analysisId, Number(area), resolvedProperty);
      }
    } catch (error) {
      const status = error?.response?.status ? ' (HTTP ' + error.response.status + ')' : '';
      setSubmitError({
        title: currentStep + '하는 단계에서 실패했습니다',
        message: errorMessage(error, '잠시 후 다시 시도해 주세요.'),
        status,
      });
      setProgressMessage('');
    } finally { setIsSubmitting(false); }
  };
  const motionVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 28, scale: prefersReducedMotion ? 1 : 0.988 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className={styles.root}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <motion.header className={styles.hero} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReducedMotion ? 0.35 : 1.05, ease: ENTRY_EASE }}>
          <span className={styles.heroBadge}>HUGME 위험도 진단</span>
          <h1 className={styles.title}>매물 위험도 진단</h1>
          <p className={styles.subtitle}>계약 전 매물 정보를 입력하고 등기부등본을 첨부해 위험 요소를 확인하세요.</p>
        </motion.header>

        <motion.div className={styles.card} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.14 } } }}>
          <motion.div className={styles.primaryColumn} variants={motionVariants}>
            <div className={styles.field}>
              <FieldLabel htmlFor="risk-address" label="주소" error={errors.address} />
              <div className={styles.inlineRow}>
                <input id="risk-address" className={styles.input} placeholder="도로명, 지번, 건물명 등으로 검색하세요" value={address} disabled={stage === 'details'} onChange={(event) => { setAddress(event.target.value); resetAddressResult(); }} />
                <button type="button" className={styles.searchButton} disabled={isSearching || stage === 'details'} onClick={handleAddressSearch}>{isSearching ? '검색 중' : '주소 검색'}</button>
              </div>
            </div>
            {unitFieldsEnabled && <TextField id="risk-ho" label="호수" value={hoName} setValue={setHoName} error={errors.hoName} placeholder="예: 1301" disabled={stage === 'details'} />}
            {stage === 'details' && <UnitField id="risk-area" label={contractAreaRequired ? '계약 면적' : '전용 면적'} unit="m²" value={area} setValue={setArea} error={errors.area} inputMode="decimal" placeholder="예: 33.12" />}
            {unitFieldsEnabled && <UnitField id="risk-floor" label="해당 층" unit="층" value={floor} setValue={setFloor} error={errors.floor} inputMode="numeric" placeholder="예: 13" disabled={stage === 'details'} />}
            <TextField id="risk-landlord" label="계약 상대방(임대인) 이름" value={landlordName} setValue={setLandlordName} error={errors.landlordName} placeholder="계약서에 적힌 임대인 이름" disabled={stage === 'details'} />
            <UnitField id="risk-deposit" label="전세보증금" unit="원" value={deposit} setValue={(value) => setDeposit(formatMoneyInput(value))} error={errors.deposit} inputMode="numeric" placeholder="예: 50,000,000" disabled={stage === 'details'} />
            <div className={styles.field}><FieldLabel htmlFor="risk-contract-date" label="계약 예정일" error={errors.contractDate} /><div className={styles.unitInputWrapper} onClick={stage === 'registry' ? openContractDatePicker : undefined}><input ref={contractDateInputRef} id="risk-contract-date" type="date" className={styles.unitInput} value={contractDate} disabled={stage === 'details'} onChange={(event) => setContractDate(event.target.value)} /></div></div>          </motion.div>

          <motion.div className={styles.sideColumn} variants={motionVariants}>
            <SearchResultPanel
              addressCandidates={addressCandidates}
              candidates={candidates}
              disabled={stage === 'details'}
              onSelectAddress={handleAddressCandidateSelect}
              error={errors.candidate}
              housingType={housingType}
              normalizedAddress={normalizedAddress}
              selectedCandidate={selectedCandidate}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
            <div className={`${styles.field} ${styles.fileField}`}>
              <FieldLabel label="등기부등본 파일" error={fileError || errors.file} />
              <div className={styles.dropzone}><div className={styles.dropzoneInfo}><span className={styles.uploadIcon}><FaArrowUp /></span><div><p className={styles.dropzoneTitle}>{file?.name ?? 'PDF 파일 업로드'}</p><p className={styles.dropzoneDescription}>PDF · 최대 10MB · 최근 1개월 이내 발급본 권장</p></div></div><input ref={fileInputRef} type="file" accept={ACCEPTED_TYPE} disabled={stage === 'details'} onChange={handleFileChange} className={styles.hiddenInput} /><button type="button" className={styles.fileSelectButton} disabled={stage === 'details'} onClick={() => fileInputRef.current?.click()}>파일 선택</button></div>
            </div>
            <div className={styles.infoBanner}><span className={styles.infoIcon}><FaCircleInfo /></span><span>주소와 주택유형에 따라 동·호 또는 계약면적 입력 항목이 자동으로 달라집니다.</span></div>
            <div className={styles.agreeField}>
              <label className={styles.agreeRow}><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>입력 정보가 실제 계약 조건과 일치함을 확인하고 서비스 이용에 동의합니다. <button type="button" className={styles.agreeLink} onClick={(event) => { event.preventDefault(); setIsConsentModalOpen(true); }}>자세히 보기</button></span></label>
              <p className={styles.agreeError} aria-live="polite">{errors.agreed || ''}</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className={styles.actionRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Button type="submit" disabled={isSubmitting} className={styles.submitButton}>{isSubmitting ? '처리 중...' : stage === 'registry' ? '등기 분석 및 위험도 진단' : '면적 입력 후 위험도 진단'}</Button></motion.div>
      </form>

      <Modal isOpen={isConsentModalOpen} onClose={() => setIsConsentModalOpen(false)}><div className={styles.consentModal}><h2 className={styles.consentModalTitle}>매물 위험도 진단 이용 동의</h2><div className={styles.consentModalBody}><ConsentSection title="입력 정보 확인">입력한 주소, 계약 조건, 계약 상대방 이름과 등기부등본은 위험도 진단에 사용됩니다.</ConsentSection><ConsentSection title="파일 이용 범위">업로드한 등기부등본은 매물의 권리관계와 위험 요소 확인 목적으로만 사용됩니다.</ConsentSection><ConsentSection title="진단 결과 안내">진단 결과는 계약 전 참고용 정보이며 최종 판단과 법적 책임은 이용자 본인에게 있습니다.</ConsentSection></div></div></Modal>
      <AreaRequiredModal isOpen={isAreaRequiredModalOpen} onClose={() => setIsAreaRequiredModalOpen(false)} contractAreaRequired={contractAreaRequired} />
      <SubmitErrorModal error={submitError} onClose={() => setSubmitError(null)} />
      <RiskProgressModal isOpen={isSubmitting} activeStep={progressStep} message={progressMessage} />
    </div>
  );
}

/** 건축물대장 dongNm은 '101동'처럼 이미 동이 붙어 오는 경우가 많다. */
function dongLabel(dongName) {
  const name = String(dongName ?? '').trim();
  if (!name) return '';
  return name.endsWith('동') ? name : `${name}동`;
}

function FieldLabel({ htmlFor, label, error }) {
  return (
    <div className={styles.labelRow}>
      <label className={styles.label} htmlFor={htmlFor}>{label} <span className={styles.required}>•</span></label>
      {error && <span className={styles.labelError}>{error}</span>}
    </div>
  );
}

function SearchResultPanel({
  addressCandidates,
  candidates,
  disabled,
  error,
  housingType,
  normalizedAddress,
  onSelectAddress,
  selectedCandidate,
  selectedIndex,
  setSelectedIndex,
}) {
  if (addressCandidates.length > 0) {
    return (
      <div className={styles.searchResultPanel}>
        <FieldLabel label="주소 검색 결과" error={error} />
        <select className={styles.input} disabled={disabled} value="" onChange={(event) => { if (event.target.value !== '') onSelectAddress(addressCandidates[Number(event.target.value)].roadAddress); }}>
          <option value="">검색된 주소 {addressCandidates.length}건 중에서 선택해 주세요</option>
          {addressCandidates.map((candidate, index) => <option key={`${candidate.roadAddress}-${index}`} value={index}>{[candidate.roadAddress, candidate.buildingName].filter(Boolean).join(' · ')}</option>)}
        </select>
        <div className={styles.searchEmptyBox}>
          <span className={styles.infoIcon}><FaCircleInfo /></span>
          <span>입력한 주소로 여러 건물이 검색되었습니다. 진단할 건물의 주소를 선택하면 다시 검색합니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchResultPanel}>
      <FieldLabel label="주소 검색 결과" error={error} />
      {candidates.length > 0 ? (
        <>
          <select className={styles.input} disabled={disabled} value={selectedIndex} onChange={(event) => setSelectedIndex(event.target.value)}>
            <option value="">건물 또는 동을 선택해 주세요</option>
            {candidates.map((candidate, index) => <option key={`${candidate.buildingName}-${candidate.dongName}-${index}`} value={index}>{[candidate.buildingName, dongLabel(candidate.dongName)].filter(Boolean).join(' · ') || HOUSING_LABEL[candidate.housingType]}</option>)}
          </select>
          {selectedCandidate && <div className={styles.housingTypeBox}><span className={styles.housingTypeInfo}><span className={styles.infoIcon}><FaCircleInfo /></span>{HOUSING_LABEL[housingType]}</span><span className={styles.housingTypeConfirmed}><FaCircleCheck /> {normalizedAddress}</span></div>}
        </>
      ) : (
        <div className={styles.searchEmptyBox}>
          <span className={styles.infoIcon}><FaCircleInfo /></span>
          <span>주소 검색 후 건물 또는 동 선택 항목이 여기에 표시됩니다.</span>
        </div>
      )}
    </div>
  );
}

function TextField({ id, label, value, setValue, error, placeholder, disabled = false }) {
  return <div className={styles.field}><FieldLabel htmlFor={id} label={label} error={error} /><input id={id} className={styles.input} placeholder={placeholder} value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} /></div>;
}

function UnitField({ id, label, unit, value, setValue, error, inputMode, placeholder, disabled = false }) {
  return <div className={styles.field}><FieldLabel htmlFor={id} label={label} error={error} /><div className={styles.unitInputWrapper}><input id={id} className={styles.unitInput} inputMode={inputMode} placeholder={placeholder} value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} /><span className={styles.unit}>{unit}</span></div></div>;
}

function RiskProgressModal({ isOpen, activeStep, message }) {
  const activeIndex = Math.max(PROGRESS_STEPS.findIndex((step) => step.key === activeStep), 0);
  const active = PROGRESS_STEPS[activeIndex];

  return (
    <Modal isOpen={isOpen} onClose={() => {}} panelClassName={styles.progressModal}>
      <p className={styles.progressEyebrow}>매물 위험도 진단</p>
      <div className={styles.progressHeader}>
        <div>
          <h2 className={styles.progressTitle}>{active.label}</h2>
          <p className={styles.progressDescription}>{message || active.description}</p>
        </div>
        <span className={styles.loadingSpinner} aria-hidden="true" />
      </div>
      <div className={styles.progressSteps} aria-label="진단 진행 상태">
        {PROGRESS_STEPS.map((step, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div key={step.key} className={styles.progressStep} data-active={isActive} data-done={isDone}>
              <span className={styles.progressNumber}>
                {isDone ? <FaCircleCheck aria-hidden="true" /> : index + 1}
              </span>
              <span className={styles.progressLabel}>{step.label}</span>
              {index < PROGRESS_STEPS.length - 1 && <span className={styles.progressBar} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function SubmitErrorModal({ error, onClose }) {
  return (
    <Modal isOpen={Boolean(error)} onClose={onClose} panelClassName={styles.submitErrorModal}>
      <div className={styles.submitErrorIcon} aria-hidden="true">
        <FaCircleInfo />
      </div>
      <h2 className={styles.submitErrorTitle}>{error?.title}</h2>
      <p className={styles.submitErrorDescription}>
        {error?.message}
        {error?.status}
      </p>
      <div className={styles.submitErrorActions}>
        <Button type="button" onClick={onClose} className={styles.submitErrorButton}>
          확인
        </Button>
      </div>
    </Modal>
  );
}

function AreaRequiredModal({ isOpen, onClose, contractAreaRequired }) {
  const areaLabel = contractAreaRequired ? '계약면적' : '전용면적';

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName={styles.submitErrorModal}>
      <div className={styles.submitErrorIcon} aria-hidden="true">
        <FaCircleInfo />
      </div>
      <h2 className={styles.submitErrorTitle}>{areaLabel} 입력이 필요합니다</h2>
      <p className={styles.submitErrorDescription}>
        등기부등본에서 {areaLabel}을 자동으로 확인하지 못했습니다. 폼에 표시된 {areaLabel}을 추가로 입력한 뒤 다시 진단해 주세요.
      </p>
      <div className={styles.submitErrorActions}>
        <Button type="button" onClick={onClose} className={styles.submitErrorButton}>
          확인
        </Button>
      </div>
    </Modal>
  );
}

function ConsentSection({ title, children }) {
  return <section className={styles.consentSection}><h3>{title}</h3><p>{children}</p></section>;
}
