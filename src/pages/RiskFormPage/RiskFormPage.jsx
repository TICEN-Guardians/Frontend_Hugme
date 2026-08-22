import { useEffect, useRef, useState } from 'react';
import {
  LuCheck,
  LuChevronRight,
  LuFileSearch,
  LuInfo,
  LuMapPin,
  LuSearch,
  LuShieldCheck,
  LuSparkles,
  LuTriangleAlert,
  LuUpload,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import {
  analyzeDiagnosis,
  createDiagnosis,
  resolveProperty,
  searchProperty,
  suggestAddresses,
  updateDiagnosisAddress,
  updateDiagnosisDetails,
  uploadRegistry,
} from '../../api/propertyRisk/propertyRiskService.js';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import { setLastRiskAnalysisId } from '../../utils/riskDiagnosisStorage.js';
import styles from './RiskFormPage.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const HOUSING_LABEL = {
  APARTMENT: '아파트',
  VILLA: '연립·다세대',
  OFFICETEL: '오피스텔',
  DETACHED_MULTI: '단독·다가구',
};
const errorCode = (error) => (
  error?.response?.data?.code
  ?? error?.response?.data?.detail?.code
);

const errorMessage = (error, fallback) => (
  error?.response?.data?.message
  ?? error?.response?.data?.detail?.message
  ?? fallback
);

const moneyInput = (value) => {
  const digits = String(value).replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('ko-KR') : '';
};

export default function RiskFormPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState(null);
  const [stage, setStage] = useState('mode');
  const [analysisId, setAnalysisId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [address, setAddress] = useState('');
  const [normalizedAddress, setNormalizedAddress] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [propertySnapshot, setPropertySnapshot] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [preferredDongName, setPreferredDongName] = useState('');
  const [hoName, setHoName] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [deposit, setDeposit] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [files, setFiles] = useState([]);
  const [registryResult, setRegistryResult] = useState(null);
  const [registryStatus, setRegistryStatus] = useState('idle');
  const [registryAddressReviewConfirmed, setRegistryAddressReviewConfirmed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const anonymous = !isAuthenticated;
  const selectedCandidate = selectedIndex === '' ? null : candidates[Number(selectedIndex)];
  const housingType = selectedCandidate?.housingType ?? null;
  const unitFieldsEnabled = !addressConfirmed || housingType !== 'DETACHED_MULTI';
  const contractAreaRequired = addressConfirmed && housingType === 'DETACHED_MULTI';
  const registryAddressMatchStatus = registryResult?.addressMatchStatus ?? null;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) setMode('QUICK');
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    const keyword = address.trim();
    if (stage !== 'form' || addressConfirmed || keyword.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      suggestAddresses(keyword, anonymous)
        .then((result) => {
          if (active) setSuggestions(result.candidates ?? []);
        })
        .catch(() => {
          if (active) setSuggestions([]);
        });
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [address, addressConfirmed, anonymous, stage]);

  const startDiagnosis = async () => {
    if (!mode) return;
    setIsStarting(true);
    setErrors({});
    try {
      const created = await createDiagnosis({ mode, anonymous });
      setAnalysisId(created.analysisId);
      setStage('form');
    } catch (error) {
      setErrors({ page: errorMessage(error, '진단을 시작하지 못했습니다.') });
    } finally {
      setIsStarting(false);
    }
  };

  const resetConfirmedAddress = (nextAddress) => {
    setAddress(nextAddress);
    setNormalizedAddress('');
    setAddressConfirmed(false);
    setPropertySnapshot(null);
    setCandidates([]);
    setSelectedIndex('');
    setErrors((current) => ({ ...current, address: '', candidate: '' }));
    setRegistryAddressReviewConfirmed(false);
    if (registryResult?.parseStatus === 'SUCCESS') {
      setRegistryResult((current) => ({
        ...current,
        addressMatchStatus: 'PENDING_ADDRESS_CONFIRMATION',
      }));
      setRegistryStatus('addressPending');
    }
  };

  const confirmAddress = async (value = address) => {
    const keyword = value.trim();
    if (!keyword) {
      setErrors((current) => ({ ...current, address: '주소를 입력해 주세요.' }));
      return;
    }
    setIsSearching(true);
    setErrors((current) => ({ ...current, address: '', candidate: '' }));
    try {
      const result = await searchProperty(keyword, anonymous);
      if (result.addressCandidates?.length) {
        setSuggestions(result.addressCandidates);
        setAddressConfirmed(false);
        return;
      }
      const nextCandidates = result.candidates ?? [];
      if (!nextCandidates.length) {
        setAddressConfirmed(false);
        setErrors((current) => ({
          ...current,
          candidate: '선택 가능한 건축물 정보를 찾지 못했습니다.',
        }));
        return;
      }
      const preferredIndex = nextCandidates.findIndex(
        (candidate) => preferredDongName && candidate.dongName === preferredDongName,
      );
      const nextIndex = preferredIndex >= 0 ? preferredIndex : 0;
      const confirmedDongName = nextCandidates[nextIndex]?.dongName || null;
      const confirmedAddress = result.normalizedAddress || keyword;
      const nextPropertySnapshot = {
        roadAddress: result.roadAddress || confirmedAddress,
        jibunAddress: result.jibunAddress || null,
      };
      setAddress(confirmedAddress);
      setNormalizedAddress(confirmedAddress);
      setSuggestions([]);
      setCandidates(nextCandidates);
      setSelectedIndex(String(nextIndex));
      setAddressConfirmed(true);
      setPropertySnapshot(nextPropertySnapshot);
      await updateDiagnosisAddress(analysisId, {
        address: confirmedAddress,
        dongName: confirmedDongName,
        hoName: hoName.trim() || null,
        propertySnapshot: nextPropertySnapshot,
        registryAddressReviewConfirmed: false,
      });
      setRegistryAddressReviewConfirmed(false);
      if (registryResult?.parseStatus === 'SUCCESS') {
        setRegistryResult((current) => ({
          ...current,
          addressMatchStatus: 'MATCH',
        }));
        setRegistryStatus('success');
        setErrors((current) => ({ ...current, files: '' }));
      }
    } catch (error) {
      const code = errorCode(error);
      if (code === 'REGISTRY_ADDRESS_PARTIAL_MATCH') {
        setRegistryResult((current) => ({
          ...current,
          addressMatchStatus: 'PARTIAL_MATCH_REVIEW_REQUIRED',
        }));
        setRegistryStatus('review');
        setRegistryAddressReviewConfirmed(false);
        setErrors((current) => ({
          ...current,
          address: '',
          files: '건물 주소는 일치하지만 등기부의 동·호를 확인하지 못했습니다.',
        }));
        return;
      }
      if (code === 'REGISTRY_ADDRESS_MISMATCH') {
        setRegistryResult((current) => ({
          ...current,
          addressMatchStatus: 'MISMATCH',
        }));
        setRegistryStatus('review');
        setRegistryAddressReviewConfirmed(false);
        setAddressConfirmed(false);
        setPropertySnapshot(null);
        setCandidates([]);
        setSelectedIndex('');
        setErrors((current) => ({
          ...current,
          address: '',
          files: errorMessage(error, '확정한 주소와 등기부 주소가 다릅니다.'),
        }));
        return;
      }
      setAddressConfirmed(false);
      setNormalizedAddress('');
      setPropertySnapshot(null);
      setCandidates([]);
      setSelectedIndex('');
      setRegistryAddressReviewConfirmed(false);
      if (registryResult?.parseStatus === 'SUCCESS') setRegistryStatus('review');
      setErrors((current) => ({
        ...current,
        address: errorMessage(error, '주소를 확인하지 못했습니다.'),
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const confirmPartialRegistryAddress = async () => {
    if (!addressConfirmed || !normalizedAddress || !propertySnapshot) return;
    setIsSearching(true);
    setErrors((current) => ({ ...current, files: '' }));
    try {
      await updateDiagnosisAddress(analysisId, {
        address: normalizedAddress,
        dongName: selectedCandidate?.dongName || preferredDongName || null,
        hoName: hoName.trim() || null,
        propertySnapshot,
        registryAddressReviewConfirmed: true,
      });
      setRegistryAddressReviewConfirmed(true);
      setRegistryResult((current) => ({
        ...current,
        addressMatchStatus: 'PARTIAL_MATCH_REVIEW_REQUIRED',
      }));
      setRegistryStatus('success');
    } catch (error) {
      setRegistryAddressReviewConfirmed(false);
      setRegistryStatus('review');
      setErrors((current) => ({
        ...current,
        files: errorMessage(error, '주소와 등기부를 다시 확인해 주세요.'),
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (candidate) => {
    const nextAddress = candidate.roadAddress || candidate.jibunAddress;
    resetConfirmedAddress(nextAddress);
    setSuggestions([]);
    confirmAddress(nextAddress);
  };

  const applyRegistryResult = (result) => {
    if (result.propertyAddress && !addressConfirmed) {
      resetConfirmedAddress(result.propertyAddress);
    }
    if (result.dongName) setPreferredDongName(result.dongName);
    if (result.hoName) setHoName(result.hoName);
    if (result.floor != null) setFloor(String(result.floor));
    if (result.exclusiveArea != null) setArea(String(result.exclusiveArea));
  };

  const handleRegistryFiles = async (event) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!picked.length) return;
    if (picked.length > 2) {
      setErrors((current) => ({ ...current, files: 'PDF는 최대 2개까지 첨부할 수 있습니다.' }));
      return;
    }
    const invalid = picked.find((file) => (
      file.type !== 'application/pdf'
      || !file.name.toLowerCase().endsWith('.pdf')
      || file.size > MAX_FILE_SIZE
    ));
    if (invalid) {
      setErrors((current) => ({
        ...current,
        files: '10MB 이하의 PDF 파일만 첨부해 주세요.',
      }));
      return;
    }

    setFiles(picked);
    setRegistryStatus('uploading');
    setRegistryResult(null);
    setErrors((current) => ({ ...current, files: '' }));
    setRegistryAddressReviewConfirmed(false);
    try {
      const result = await uploadRegistry({ analysisId, files: picked });
      setRegistryResult(result);
      applyRegistryResult(result);
      if (result.parseStatus !== 'SUCCESS') {
        setRegistryStatus('review');
        setErrors((current) => ({
          ...current,
          files: '등기부 내용을 정상적으로 확인하지 못했습니다. 파일을 다시 첨부해 주세요.',
        }));
      } else if (result.addressMatchStatus === 'MATCH') {
        setRegistryStatus('success');
      } else if (result.addressMatchStatus === 'PENDING_ADDRESS_CONFIRMATION') {
        setRegistryStatus('addressPending');
      } else {
        setRegistryStatus('review');
        const message = result.addressMatchStatus === 'UNREADABLE'
          ? '등기부에서 비교할 부동산 주소를 읽지 못했습니다.'
          : result.addressMatchStatus === 'MISMATCH'
          ? '확정한 주소와 등기부의 부동산 주소가 다릅니다.'
          : '건물 주소는 일치하지만 등기부의 동·호를 확인하지 못했습니다.';
        setErrors((current) => ({ ...current, files: message }));
      }
    } catch (error) {
      setRegistryStatus('error');
      setErrors((current) => ({
        ...current,
        files: errorMessage(error, '등기부등본을 분석하지 못했습니다.'),
      }));
    }
  };

  const validate = () => {
    const next = {};
    if (!addressConfirmed || !normalizedAddress) next.address = '주소를 검색해 확정해 주세요.';
    if (!selectedCandidate) next.candidate = '진단할 건물 또는 동을 선택해 주세요.';
    if (unitFieldsEnabled) {
      if (!hoName.trim()) next.hoName = '호수를 입력해 주세요.';
      if (String(floor).trim() === '' || !Number.isInteger(Number(floor))) {
        next.floor = '층을 정수로 입력해 주세요.';
      }
    }
    if (!area || Number(area) <= 0) {
      next.area = `${contractAreaRequired ? '계약면적' : '전용면적'}을 입력해 주세요.`;
    }
    if (!deposit || Number(deposit.replaceAll(',', '')) <= 0) next.deposit = '보증금을 입력해 주세요.';
    if (!contractDate) next.contractDate = '계약 예정일을 입력해 주세요.';
    if (mode === 'DETAILED' && !landlordName.trim()) next.landlordName = '계약 상대방 이름을 입력해 주세요.';
    if (mode === 'DETAILED' && registryStatus !== 'success') next.files = '정상 확인된 등기부등본이 필요합니다.';
    if (!agreed) next.agreed = '서비스 이용에 동의해 주세요.';
    return next;
  };

  const submitDiagnosis = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      setProgressMessage('주소와 건축물 정보를 확인하고 있습니다.');
      const resolved = await resolveProperty({
        address: normalizedAddress,
        dongName: selectedCandidate.dongName,
        hoName: unitFieldsEnabled ? hoName.trim() : null,
        anonymous,
      });
      const usesContractArea = resolved.contractAreaRequired;
      if (mode === 'DETAILED') {
        setNormalizedAddress(resolved.normalizedAddress);
        setPropertySnapshot(resolved.propertySnapshot);
      }
      setProgressMessage('입력한 계약 조건을 저장하고 있습니다.');
      await updateDiagnosisDetails(analysisId, {
        address: resolved.normalizedAddress,
        dongName: resolved.dongName || selectedCandidate.dongName || null,
        hoName: usesContractArea ? null : (resolved.hoName || hoName.trim()),
        deposit: Number(deposit.replaceAll(',', '')),
        contractDate,
        contractArea: usesContractArea ? Number(area) : null,
        exclusiveArea: usesContractArea ? null : Number(area),
        floor: usesContractArea ? null : Number(floor),
        landlordName: mode === 'DETAILED' ? landlordName.trim() : null,
        propertySnapshot: resolved.propertySnapshot,
        registryAddressReviewConfirmed,
      });
      setProgressMessage('시세와 계약 조건을 바탕으로 위험도를 계산하고 있습니다.');
      await analyzeDiagnosis(analysisId);
      if (isAuthenticated) setLastRiskAnalysisId(user?.email, analysisId);
      navigate(`/risk/${analysisId}`);
    } catch (error) {
      const code = errorCode(error);
      if ([
        'REGISTRY_ADDRESS_PARTIAL_MATCH',
        'REGISTRY_ADDRESS_MISMATCH',
      ].includes(code)) {
        const matchStatus = code === 'REGISTRY_ADDRESS_MISMATCH'
          ? 'MISMATCH'
          : 'PARTIAL_MATCH_REVIEW_REQUIRED';
        setRegistryResult((current) => ({ ...current, addressMatchStatus: matchStatus }));
        setRegistryStatus('review');
        setRegistryAddressReviewConfirmed(false);
        setErrors((current) => ({
          ...current,
          page: '',
          files: errorMessage(error, '주소와 등기부를 다시 확인해 주세요.'),
        }));
        return;
      }
      setErrors((current) => ({
        ...current,
        page: errorMessage(error, '진단을 완료하지 못했습니다.'),
      }));
    } finally {
      setIsSubmitting(false);
      setProgressMessage('');
    }
  };

  if (isAuthLoading) {
    return <div className={styles.root}><div className={styles.stateCard}>사용자 정보를 확인하고 있습니다.</div></div>;
  }

  if (stage === 'mode') {
    return (
      <div className={styles.root}>
        <section className={styles.modePanel}>
          <span className={styles.eyebrow}><LuSparkles /> 전세 위험도 진단</span>
          <h1>어떤 방식으로 확인할까요?</h1>
          <p className={styles.lead}>간편진단은 가격·시장 중심, 정밀진단은 등기 권리관계까지 함께 확인합니다.</p>
          <div className={styles.modeGrid}>
            <button
              type="button"
              className={`${styles.modeCard} ${mode === 'QUICK' ? styles.selectedMode : ''}`}
              onClick={() => setMode('QUICK')}
            >
              <span className={styles.modeIcon}><LuSparkles /></span>
              <strong>간편진단</strong>
              <span>등기부 없이 시세와 계약 조건을 빠르게 비교합니다.</span>
              <em>비로그인·로그인 모두 이용 가능</em>
            </button>
            {isAuthenticated && (
              <button
                type="button"
                className={`${styles.modeCard} ${mode === 'DETAILED' ? styles.selectedMode : ''}`}
                onClick={() => setMode('DETAILED')}
              >
                <span className={styles.modeIcon}><LuShieldCheck /></span>
                <strong>정밀진단</strong>
                <span>등기부의 소유자와 권리관계, 담보 부담까지 확인합니다.</span>
                <em>로그인 및 등기부등본 필수</em>
              </button>
            )}
          </div>
          {!isAuthenticated && (
            <p className={styles.loginHint}>정밀진단은 로그인 후 이용할 수 있습니다.</p>
          )}
          {errors.page && <p className={styles.pageError}>{errors.page}</p>}
          <Button className={styles.startButton} disabled={!mode || isStarting} onClick={startDiagnosis}>
            {isStarting ? '진단을 준비하고 있습니다.' : '선택한 진단 시작'}
            {!isStarting && <LuChevronRight />}
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.formShell}>
        <header className={styles.formHeader}>
          <div>
            <span className={styles.modeBadge}>{mode === 'QUICK' ? '간편진단' : '정밀진단'}</span>
            <h1>전세 계약 정보를 확인해 주세요</h1>
            <p>자동으로 채워진 값도 계약서와 비교해 수정할 수 있습니다.</p>
          </div>
          <span className={styles.analysisId}>진단번호 {analysisId}</span>
        </header>

        {mode === 'DETAILED' && (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>1</span>
              <div><h2>등기부등본 분석</h2><p>집합건물은 PDF 1개, 토지·건물은 PDF 2개를 함께 첨부할 수 있습니다.</p></div>
            </div>
            <button type="button" className={styles.uploadBox} onClick={() => fileInputRef.current?.click()} disabled={registryStatus === 'uploading'}>
              <LuUpload />
              <strong>{registryStatus === 'uploading' ? '등기부 내용을 확인하고 있습니다.' : '등기부등본 PDF 선택'}</strong>
              <span>파일당 10MB 이하 · 최대 2개</span>
            </button>
            <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="application/pdf,.pdf" multiple onChange={handleRegistryFiles} />
            {files.length > 0 && <ul className={styles.fileList}>{files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>}
            {registryStatus === 'success' && (
              <div className={styles.successBox}>
                <LuCheck />
                <div>
                  <strong>등기부등본을 확인했습니다.</strong>
                  <span>{registryAddressReviewConfirmed
                    ? '부분 일치한 동·호를 사용자가 확인했습니다.'
                    : '추출된 주소와 면적은 아래 입력칸에 후보값으로 채웠습니다.'}</span>
                </div>
              </div>
            )}
            {registryStatus === 'addressPending' && (
              <div className={styles.pendingBox}>
                <LuInfo />
                <div>
                  <strong>등기부 주소 확인이 남았습니다.</strong>
                  <span>추출된 주소를 아래 검색창에서 확인하거나 수정한 뒤 주소 확인을 눌러 주세요.</span>
                </div>
              </div>
            )}
            {[
              'PARTIAL_MATCH_REVIEW_REQUIRED',
              'MISMATCH',
            ].includes(registryAddressMatchStatus) && !registryAddressReviewConfirmed && (
              <div className={styles.addressReviewBox}>
                <div className={styles.addressReviewTitle}>
                  <LuTriangleAlert />
                  <strong>
                    {registryAddressMatchStatus === 'MISMATCH'
                      ? '입력 주소와 등기부 주소가 다릅니다.'
                      : '동·호 정보가 부분 일치합니다.'}
                  </strong>
                </div>
                <dl className={styles.addressCompare}>
                  <div>
                    <dt>사용자가 확인한 주소</dt>
                    <dd>{normalizedAddress || '주소 확정 필요'}</dd>
                  </div>
                  <div>
                    <dt>등기부에서 추출한 주소</dt>
                    <dd>{registryResult?.propertyAddress || '판독 불가'}</dd>
                  </div>
                </dl>
                {registryAddressMatchStatus === 'PARTIAL_MATCH_REVIEW_REQUIRED' && (
                  <button
                    type="button"
                    className={styles.reviewConfirmButton}
                    onClick={confirmPartialRegistryAddress}
                    disabled={isSearching || !propertySnapshot}
                  >
                    두 주소를 확인했으며 이 등기부로 진행
                  </button>
                )}
              </div>
            )}
            {registryResult?.currentOwners?.length > 0 && (
              <p className={styles.ownerInfo}>등기부상 현재 소유자: {registryResult.currentOwners.map((owner) => owner.name).join(', ')}</p>
            )}
            {errors.files && <p className={styles.fieldError}>{errors.files}</p>}
          </section>
        )}

        <form onSubmit={(event) => event.preventDefault()}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>{mode === 'DETAILED' ? '2' : '1'}</span>
              <div><h2>주소 확정</h2><p>검색 결과에서 주소를 선택하거나 입력된 주소를 검색해 확정해 주세요.</p></div>
            </div>
            <div className={styles.addressControl}>
              <LuMapPin aria-hidden="true" />
              <input
                value={address}
                onChange={(event) => resetConfirmedAddress(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    confirmAddress();
                  }
                }}
                placeholder="도로명, 지번 또는 건물명을 입력해 주세요"
                autoComplete="off"
              />
              <button type="button" onClick={() => confirmAddress()} disabled={isSearching}>
                <LuSearch /> {isSearching ? '확인 중' : '주소 확인'}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className={styles.suggestionList}>
                {suggestions.map((candidate) => (
                  <button key={`${candidate.roadAddress}-${candidate.jibunAddress}`} type="button" onClick={() => selectSuggestion(candidate)}>
                    <strong>{candidate.roadAddress}</strong>
                    <span>{candidate.jibunAddress}{candidate.buildingName ? ` · ${candidate.buildingName}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
            {addressConfirmed && <p className={styles.confirmedAddress}><LuCheck /> {normalizedAddress}</p>}
            {errors.address && <p className={styles.fieldError}>{errors.address}</p>}

            {candidates.length > 0 && (
              <label className={styles.field}>
                <span>건물 또는 동</span>
                <select value={selectedIndex} onChange={(event) => setSelectedIndex(event.target.value)}>
                  {candidates.map((candidate, index) => (
                    <option key={`${candidate.dongName}-${index}`} value={String(index)}>
                      {[candidate.buildingName, candidate.dongName, HOUSING_LABEL[candidate.housingType]].filter(Boolean).join(' · ')}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {errors.candidate && <p className={styles.fieldError}>{errors.candidate}</p>}
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>{mode === 'DETAILED' ? '3' : '2'}</span>
              <div><h2>계약 조건</h2><p>주소가 확정되면 주택유형에 필요하지 않은 항목은 자동으로 사라집니다.</p></div>
            </div>
            <div className={styles.fieldGrid}>
              {unitFieldsEnabled && (
                <>
                  <label className={styles.field}><span>호수</span><input value={hoName} onChange={(event) => setHoName(event.target.value)} placeholder="예: 302호" />{errors.hoName && <small>{errors.hoName}</small>}</label>
                  <label className={styles.field}><span>층</span><input type="number" value={floor} onChange={(event) => setFloor(event.target.value)} placeholder="예: 3" />{errors.floor && <small>{errors.floor}</small>}</label>
                </>
              )}
              <label className={styles.field}><span>{contractAreaRequired ? '계약면적' : '전용면적'} (㎡)</span><input type="number" min="0" step="0.01" value={area} onChange={(event) => setArea(event.target.value)} />{errors.area && <small>{errors.area}</small>}</label>
              <label className={styles.field}><span>전세보증금</span><input value={deposit} onChange={(event) => setDeposit(moneyInput(event.target.value))} inputMode="numeric" placeholder="원 단위" />{errors.deposit && <small>{errors.deposit}</small>}</label>
              <label className={styles.field}><span>계약 예정일</span><input type="date" value={contractDate} onChange={(event) => setContractDate(event.target.value)} />{errors.contractDate && <small>{errors.contractDate}</small>}</label>
              {mode === 'DETAILED' && (
                <label className={styles.field}><span>계약 상대방 이름</span><input value={landlordName} onChange={(event) => setLandlordName(event.target.value)} placeholder="계약서에 적힌 임대인 이름" />{errors.landlordName && <small>{errors.landlordName}</small>}</label>
              )}
            </div>
          </section>

          {mode === 'QUICK' && (
            <div className={styles.infoBox}>
              <LuInfo />
              <p><strong>간편진단에는 등기 권리관계가 포함되지 않습니다.</strong><span>결과에서 정밀진단으로 추가 확인할 항목을 안내해 드립니다.</span></p>
            </div>
          )}

          <label className={styles.consent}>
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>입력한 정보를 전세 위험도 분석에 사용하는 데 동의합니다.</span>
          </label>
          {errors.agreed && <p className={styles.fieldError}>{errors.agreed}</p>}
          {errors.page && <p className={styles.pageError}>{errors.page}</p>}
          <Button className={styles.submitButton} disabled={isSubmitting} onClick={submitDiagnosis}>
            {isSubmitting ? progressMessage : '진단 시작'}
            {!isSubmitting && <LuFileSearch />}
          </Button>
        </form>
      </div>
    </div>
  );
}
