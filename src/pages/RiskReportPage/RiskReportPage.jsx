import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuCircleAlert,
  LuCircleCheck,
  LuCircleHelp,
  LuFileCheck,
  LuInfo,
  LuRotateCcw,
  LuTriangleAlert,
  LuTrendingDown,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import ReportAnalysis from '../../components/risk/report/ReportAnalysis/ReportAnalysis.jsx';
import ReportHeader from '../../components/risk/report/ReportHeader/ReportHeader.jsx';
import RiskSummaryRail from '../../components/risk/report/RiskSummaryRail/RiskSummaryRail.jsx';
import { getDiagnosis } from '../../api/propertyRisk/propertyRiskService.js';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import {
  clearAnonymousRiskSession,
  clearLastRiskAnalysisId,
  setLastRiskAnalysisId,
} from '../../utils/riskDiagnosisStorage.js';
import styles from './RiskReportPage.module.css';

const GRADE = {
  LOW: { label: '낮음', tone: 'success' },
  MEDIUM: { label: '보통', tone: 'warning' },
  HIGH: { label: '주의', tone: 'warning' },
  CRITICAL: { label: '위험', tone: 'danger' },
};

const SCORE_FLOOR_REASON = {
  RECOVERY_SHORTFALL: '담보부담액이 예상 매매가를 초과함',
  NO_RECOVERY_BUFFER: '담보부담액이 예상 매매가와 같아 회수 여유가 없음',
  EXTREME_LEASE_DEVIATION: '보증금이 예상 전세가보다 25% 이상 높음',
  COMBINED_PRICE_RISK: '담보부담률 80% 이상과 전세시세 이탈 5% 이상',
  SEIZURE: '압류 확인',
  PROVISIONAL_SEIZURE: '가압류 확인',
  PROVISIONAL_DISPOSITION: '가처분 확인',
  AUCTION_COMMENCED: '경매개시 확인',
  TRUST_REGISTRATION: '신탁등기 확인',
  SENIOR_LEASE_RIGHT: '유효한 선순위 전세권·임차권등기 확인',
  OWNER_MISMATCH: '임대인과 등기 소유자 불일치',
  BAD_LANDLORD_MATCH: '악성임대인 확인 대상과 일치',
};

const HOUSING = {
  APARTMENT: '아파트',
  VILLA: '연립·다세대',
  OFFICETEL: '오피스텔',
  DETACHED_MULTI: '단독·다가구',
};

const VERDICT = {
  SAFE: { label: '안전', tone: 'safe' },
  CAUTION: { label: '주의', tone: 'caution' },
  RISK: { label: '위험', tone: 'risk' },
};

const REGISTRY_FLAGS = [
  { key: 'seizure', label: '압류' },
  { key: 'provisionalSeizure', label: '가압류' },
  { key: 'provisionalDisposition', label: '가처분' },
  { key: 'auctionCommenced', label: '경매개시' },
  { key: 'trustRegistration', label: '신탁등기' },
  { key: 'jeonseRight', label: '선순위 전세권' },
  { key: 'leaseholdRegistration', label: '임차권등기' },
];

const REGISTRY_PARSE_STATUS = {
  SUCCESS: '정상 판독',
  PARTIAL: '일부 판독',
  NEEDS_REVIEW: '재확인 필요',
  FAILED: '판독 실패',
};

const REGISTRY_CONFIDENCE = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
  UNKNOWN: '확인 불가',
};

const REGISTRY_ADDRESS_MATCH = {
  MATCH: '일치',
  PARTIAL_MATCH_REVIEW_REQUIRED: '부분 일치',
  MISMATCH: '불일치',
  UNREADABLE: '판독 불가',
  PENDING_ADDRESS_CONFIRMATION: '주소 확정 대기',
};

const REGISTRY_OWNER_MATCH = {
  TRUE: '일치',
  FALSE: '불일치',
  UNKNOWN: '확인 불가',
};

const REGISTRY_RIGHT_TYPE = {
  OWNERSHIP: '소유권',
  MORTGAGE: '근저당권',
  MORTGAGE_AMEND: '근저당권 변경',
  MORTGAGE_TRANSFER: '근저당권 이전',
  SEIZURE: '압류',
  PROVISIONAL_SEIZURE: '가압류',
  PROVISIONAL_DISPOSITION: '가처분',
  AUCTION: '경매개시',
  TRUST: '신탁등기',
  JEONSE_RIGHT: '전세권',
  LEASEHOLD_REGISTRATION: '임차권등기',
  CANCELLATION: '말소',
  OTHER: '기타 권리',
};
const REGISTRY_SECTION = {
  GAP: '갑구',
  EUL: '을구',
};

const WATCHLIST_MATCH_STATUS = {
  MATCH_HIGH: '명단 일치',
  MATCH_NAME_ONLY: '이름 일치 · 추가 확인 필요',
  NO_MATCH: '일치 없음',
  UNKNOWN: '확인 불가',
};

const WATCHLIST_MATCH_TYPE = {
  EXACT: '정확 일치',
  MANUAL_REVIEW: '수동 확인 필요',
};


export default function RiskReportPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getDiagnosis(reportId)
      .then((result) => {
        if (!active) return;
        setData(result);
        setLastRiskAnalysisId(user?.email, reportId);
      })
      .catch((requestError) => active && setError(
        requestError?.response?.data?.message ?? '진단 결과를 불러오지 못했습니다.',
      ));

    return () => { active = false; };
  }, [reportId, user?.email]);

  const handleRestartDiagnosis = () => {
    clearLastRiskAnalysisId(user?.email);
    clearAnonymousRiskSession(reportId);
    setIsRestartModalOpen(false);
    navigate('/risk/new');
  };

  if (error) return <ReportState message={error} />;
  if (!data) return <ReportState message="진단 결과를 불러오고 있습니다." />;

  const report = toReportViewModel(data);
  const motionSet = createMotionSet(shouldReduceMotion);

  return (
    <motion.div
      className={styles.root}
      initial={motionSet.page.hidden}
      animate={motionSet.page.visible}
      transition={motionSet.page.visible.transition}
    >
      <div className={styles.reportContainer}>
        <ReportHeader report={report} onRestart={() => setIsRestartModalOpen(true)} motionSet={motionSet} />

        <div className={styles.reportLayout}>
          <div className={styles.summaryColumn}>
            <RiskSummaryRail summary={report} motionSet={motionSet} />
          </div>
          <ReportAnalysis report={report} motionSet={motionSet} />
        </div>

        <p className={styles.disclaimer}>
          {report.isDetailed
            ? '본 리포트는 AI와 규칙 기반 분석을 이용한 참고자료이며, 계약 전 최신 등기부와 전문가 검토가 필요합니다.'
            : '간편진단은 등기 권리관계를 반영하지 않은 참고 결과입니다. 계약 전 정밀진단과 최신 등기부 확인이 필요합니다.'}
        </p>
      </div>

      <Modal isOpen={isRestartModalOpen} onClose={() => setIsRestartModalOpen(false)} panelClassName={styles.restartModal}>
        <h2 className={styles.restartModalTitle}>새로운 매물을 분석하시겠습니까?</h2>
        <p className={styles.restartModalDescription}>
          새로운 분석을 시작하면 매물 정보를 처음부터 다시 입력하게 됩니다. 현재 분석 결과는 삭제되지 않습니다.
        </p>
        <div className={styles.restartModalActions}>
          <Button variant="secondary" onClick={() => setIsRestartModalOpen(false)}>취소</Button>
          <Button className={styles.restartConfirmButton} onClick={handleRestartDiagnosis}>
            <LuRotateCcw aria-hidden="true" />
            <span>다시 분석하기</span>
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}

function createMotionSet(shouldReduceMotion) {
  if (shouldReduceMotion) {
    const visible = { opacity: 1, transition: { duration: 0 } };
    return {
      page: { hidden: { opacity: 1 }, visible },
      item: { hidden: { opacity: 1 }, visible },
      rail: { hidden: { opacity: 1 }, visible },
      main: { hidden: { opacity: 1 }, visible },
      section: { hidden: { opacity: 1 }, visible },
      buttonHover: {},
      buttonTap: {},
    };
  }

  const sectionVariant = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return {
    page: sectionVariant,
    item: sectionVariant,
    rail: {
      hidden: { opacity: 0, x: -12 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
    },
    main: sectionVariant,
    section: sectionVariant,
    buttonHover: { y: -1 },
    buttonTap: { scale: 0.98 },
  };
}

function ReportState({ message }) {
  return (
    <div className={styles.root}>
      <div className={styles.reportContainer}>
        <div className={styles.stateCard}>{message}</div>
      </div>
    </div>
  );
}

function toReportViewModel(data) {
  const risk = data.risk ?? {};
  const breakdown = risk.breakdown ?? {};
  const valuation = data.valuation ?? {};
  const property = data.property ?? {};
  const indicators = data.indicators ?? {};
  const registry = data.registry ?? null;
  const registryVerification = registryVerificationViewModel(data.registryVerification);
  const isDetailed = data.mode === 'DETAILED';
  const reportDetail = data.reportDetail ?? {};
  const explanation = reportDetail.explanation ?? {};
  const weights = risk.weights ?? {};

  const grade = GRADE[risk.grade] ?? GRADE.MEDIUM;
  const sale = numberOrNull(valuation.estimatedSalePrice);
  const lease = numberOrNull(valuation.estimatedLeasePrice);
  const deposit = numberOrNull(
    findMetric(data, 'valuation', 'deposit')?.value
    ?? findMetric(data, 'collateral', 'deposit')?.value,
  );
  const mortgage = numberOrNull(registry?.totalActiveMaxClaimAmount);
  const recoverableAmount = numberOrNull(indicators.recoverableAmount);
  const remaining = numberOrNull(indicators.remainingCollateralCapacity);
  const depositShortfall = numberOrNull(indicators.depositShortfall);
  const leaseToSaleRate = numberOrNull(indicators.leaseToSaleRate);
  const leasePriceGapRate = numberOrNull(indicators.leasePriceGapRate);
  const collateralBurdenRate = numberOrNull(indicators.collateralBurdenRate);
  const recovery = recoveryInfo({ remaining, depositShortfall });
  const contribution = riskContributions({
    breakdown,
    weights,
    isDetailed,
  });
  const notices = reportDetail.notices ?? [];
  const riskReasons = analysisReasons({
    riskNotices: notices.filter((item) => item.severity !== 'INFO'),
    keyFindings: explanation.keyFindings ?? [],
    cautions: explanation.cautions ?? [],
  });
  const priceBars = [
    { label: 'AI 예상 매매가', amount: sale ?? 0, valueLabel: money(sale), shortLabel: shortMoney(sale), color: '#0F75BD' },
    { label: 'AI 예상 전세가', amount: lease ?? 0, valueLabel: money(lease), shortLabel: shortMoney(lease), color: '#3E9A43' },
    {
      label: '계약 보증금',
      amount: deposit ?? 0,
      valueLabel: money(deposit),
      shortLabel: shortMoney(deposit),
      color: isDepositRisk({ deposit, sale, lease, leasePriceGapRate, recoverableAmount }) ? '#e0574c' : '#0F75BD',
    },
  ];
  const trackMax = Math.max(recoverableAmount ?? 0, deposit ?? 0, 1);
  const recoverableWidth = ((recoverableAmount ?? 0) / trackMax) * 100;
  const depositWidth = ((deposit ?? 0) / trackMax) * 100;
  const scenarios = (reportDetail.priceScenarios ?? []).map((item) => ({
    label: item.label,
    price: money(numberOrNull(item.estimatedSalePrice)),
    rate: ratio(numberOrNull(item.collateralBurdenRate)),
    rateValue: numberOrNull(item.collateralBurdenRate) ?? 0,
    verdictLabel: VERDICT[item.verdict]?.label ?? '확인 필요',
    verdictTone: VERDICT[item.verdict]?.tone ?? 'caution',
  }));
  const maxScenarioRate = Math.max(...scenarios.map((item) => item.rateValue), 1);

  return {
    mode: data.mode,
    isDetailed,
    scoreEyebrow: isDetailed ? '종합 위험도' : '간편 위험도',
    title: reportDetail.title,
    badgeLabel: `위험도 ${grade.label}`,
    badgeTone: grade.tone,
    address: property.normalizedAddress,
    housingType: HOUSING[property.housingType] ?? property.housingType,
    analyzedAt: dateTime(data.analyzedAt),
    totalScore: risk.score,
    maxScore: weights.total ?? 100,
    summary: explanation.summary,
    conclusionHeadline: `전세 위험도가 ${grade.label}으로 평가되었습니다.`,
    conclusionDescription: explanation.summary,
    saleLabel: money(sale),
    leaseLabel: money(lease),
    depositLabel: money(deposit),
    recoveryStatusLabel: recovery.label,
    recoveryTone: recovery.tone,
    majorRisks: majorRisks({
      depositShortfall,
      leaseToSaleRate,
      valuationReliability: data.valuationReliability,
      collateralBurdenRate,
      notices,
      floorReasons: risk.floorReasons,
    }),
    metricChips: [
      { label: '전세가율', value: ratio(leaseToSaleRate) },
      { label: '전세시세 괴리율', value: ratio(leasePriceGapRate) },
      isDetailed ? { label: '담보부담률', value: ratio(collateralBurdenRate) } : null,
    ].filter(Boolean),
    priceBars,
    reliabilityLabel: reliabilityLabel(data.valuationReliability),
    scenarios: scenarios.map((item) => ({
      ...item,
      progressWidth: Math.max((item.rateValue / maxScenarioRate) * 100, item.rateValue > 0 ? 8 : 0),
    })),
    priceInsights: priceInsights({ deposit, lease, depositShortfall, leasePriceGapRate }),
    collateral: {
      burdenRateLabel: ratio(collateralBurdenRate),
      recoverableLabel: money(recoverableAmount),
      depositLabel: money(deposit),
      recoverableWidth,
      depositWidth,
      depositBaseWidth: Math.min(recoverableWidth, depositWidth),
      excessWidth: Math.max(depositWidth - recoverableWidth, 0),
      shortfallLabel: recovery.tone === 'danger' ? recovery.label : '',
      rows: [
        { label: '선순위 근저당', value: money(mortgage) },
        { label: '계약 보증금', value: money(deposit) },
        { label: '보증금 회수 가능 기준액', value: money(recoverableAmount) },
        { label: '부족액', value: recovery.tone === 'danger' ? recovery.label : '없음', tone: recovery.tone },
      ],
    },
    registrySummary: registrySummary(registryChecks(registry)).label,
    registrySummaryTone: registrySummary(registryChecks(registry)).tone,
    registryChecks: registryChecks(registry),
    registryVerification,
    contribution,
    hasScoreAdjustments: contribution.some((item) => item.isAdjustment),
    riskReasons,
    reasonGroups: riskReasons,
    recommendedActions: recommendedActions(explanation.recommendedActions ?? []),
  };
}

function riskContributions({ breakdown, weights, isDetailed }) {
  const hasCurrentContract = [
    breakdown.priceBurden,
    breakdown.leaseMarketDeviation,
    breakdown.marketTrend,
  ].some((value) => value != null);
  const items = hasCurrentContract
    ? [
      {
        label: isDetailed ? '담보 회수부담' : '계약가격 부담',
        score: numberOrZero(breakdown.priceBurden),
        max: numberOrZero(weights.priceBurden),
        color: '#0F75BD',
      },
      {
        label: '주변 전세수준 이탈',
        score: numberOrZero(breakdown.leaseMarketDeviation),
        max: numberOrZero(weights.leaseMarketDeviation),
        color: '#2F8F68',
      },
      {
        label: '시장 추세',
        score: numberOrZero(breakdown.marketTrend),
        max: numberOrZero(weights.marketTrend),
        color: '#7C6BC4',
      },
      {
        label: '가격 위험 하한 조정',
        score: numberOrZero(breakdown.policyAdjustment),
        isAdjustment: true,
        color: '#D68A16',
      },
      {
        label: '등기 권리 하한 조정',
        score: numberOrZero(breakdown.rightsAdjustment),
        isAdjustment: true,
        color: '#D94841',
      },
    ]
    : [
      {
        label: '깡통전세 위험',
        score: numberOrZero(breakdown.underwater),
        max: numberOrZero(weights.underwater),
        color: '#0F75BD',
      },
      {
        label: '역전세 위험',
        score: numberOrZero(breakdown.rollover),
        max: numberOrZero(weights.rollover),
        color: '#2F8F68',
      },
      {
        label: '주택 특성',
        score: numberOrZero(breakdown.property),
        max: numberOrZero(weights.property),
        color: '#7C6BC4',
      },
      {
        label: '시장 상황',
        score: numberOrZero(breakdown.market),
        max: numberOrZero(weights.market),
        color: '#64748B',
      },
    ];

  return items
    .filter((item) => (item.isAdjustment ? item.score > 0 : item.max > 0))
    .map((item) => {
      if (item.isAdjustment) {
        return {
          ...item,
          ratio: Math.min(item.score, 100),
          ratioLabel: `+${item.score}점`,
          scoreLabel: `최종점수에 +${item.score}점`,
        };
      }
      const contributionRatio = Math.round((item.score / item.max) * 100);
      return {
        ...item,
        ratio: contributionRatio,
        ratioLabel: `${contributionRatio}%`,
        scoreLabel: `${item.score} / ${item.max}점`,
      };
    });
}

function money(value) {
  return value == null ? '확인 필요' : `${Number(value).toLocaleString('ko-KR')}원`;
}

function shortMoney(value) {
  if (value == null) return '확인 필요';
  const number = Number(value);
  if (!Number.isFinite(number)) return '확인 필요';
  if (Math.abs(number) >= 100000000) return `${(number / 100000000).toFixed(2)}억`;
  if (Math.abs(number) >= 10000) return `${Math.round(number / 10000).toLocaleString('ko-KR')}만`;
  return number.toLocaleString('ko-KR');
}

function ratio(value) {
  return value == null ? '확인 필요' : `${Number(value).toFixed(2)}%`;
}

function numberOrNull(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function numberOrZero(value) {
  return numberOrNull(value) ?? 0;
}

function dateTime(value) {
  if (value == null) return '';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function reliabilityLabel(value) {
  return { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' }[value] ?? null;
}

const LEASE_GAP_DANGER_RATE = 5;

function isDepositRisk({ deposit, sale, lease, leasePriceGapRate, recoverableAmount }) {
  if (deposit == null) return false;
  if (sale != null && deposit > sale) return true;
  if (recoverableAmount != null && deposit > recoverableAmount) return true;
  if (leasePriceGapRate != null) return leasePriceGapRate > LEASE_GAP_DANGER_RATE;
  return lease != null && deposit > lease;
}

function recoveryInfo({ remaining, depositShortfall }) {
  const shortfall = depositShortfall != null && depositShortfall > 0
    ? depositShortfall
    : remaining != null && remaining < 0
      ? Math.abs(remaining)
      : null;

  if (shortfall != null) return { label: `${money(shortfall).replace('원', '')}원 부족`, tone: 'danger' };
  if (remaining == null && depositShortfall == null) return { label: '확인 필요', tone: undefined };

  const room = remaining != null ? Math.abs(remaining) : Math.abs(depositShortfall ?? 0);
  return { label: `${money(room).replace('원', '')}원 여유`, tone: 'success' };
}

function majorRisks({
  depositShortfall,
  leaseToSaleRate,
  valuationReliability,
  collateralBurdenRate,
  notices,
  floorReasons = [],
}) {
  const risks = [];
  floorReasons.forEach((code) => {
    const label = SCORE_FLOOR_REASON[code];
    if (label && !risks.includes(label)) risks.push(label);
  });
  if ((depositShortfall ?? 0) > 0) risks.push('보증금 회수 부족');
  if ((leaseToSaleRate ?? 0) > 100) risks.push('전세가율 100% 초과');
  if (valuationReliability === 'LOW') risks.push('시세 신뢰도 낮음');
  if ((collateralBurdenRate ?? 0) > 100) risks.push('담보부담률 100% 초과');
  notices.filter((item) => item.severity !== 'INFO').forEach((item) => {
    if (item.title && !risks.includes(item.title)) risks.push(item.title);
  });
  return risks.slice(0, 4);
}

function priceInsights({ deposit, lease, depositShortfall, leasePriceGapRate }) {
  const insights = [];

  if (leasePriceGapRate != null) {
    insights.push({
      text: `계약 보증금이 AI 예상 전세시세보다 ${ratio(Math.abs(leasePriceGapRate))} ${leasePriceGapRate > 0 ? '높습니다.' : '낮습니다.'}`,
      tone: leasePriceGapRate > 0 ? 'danger' : undefined,
    });
  } else if (deposit != null && lease != null) {
    insights.push({
      text: `계약 보증금과 AI 예상 전세시세 차이는 ${money(deposit - lease)}입니다.`,
      tone: deposit > lease ? 'danger' : undefined,
    });
  }

  if (depositShortfall != null && depositShortfall > 0) {
    insights.push({
      text: `예상 매매가 기준 ${money(depositShortfall)}의 회수 부족이 발생합니다.`,
      tone: 'danger',
    });
  }

  return insights.slice(0, 2);
}

function analysisReasons({ riskNotices, keyFindings, cautions }) {
  const seen = new Set();
  const shownDescriptions = new Set();
  const evidence = [];
  const cautionItems = [];

  const addEvidence = ({ label, description, icon }) => {
    const key = `${label ?? ''}|${description ?? ''}`;
    if (!label || seen.has(key)) return;
    seen.add(key);
    shownDescriptions.add(reasonKey(description));
    evidence.push({ label: normalizeReasonLabel(label), description, icon });
  };

  const addCaution = (description) => {
    if (!description || shownDescriptions.has(reasonKey(description))) return;
    shownDescriptions.add(reasonKey(description));
    cautionItems.push({ description });
  };

  riskNotices.forEach((item) => addEvidence({
    icon: <LuTriangleAlert />,
    label: item.title,
    description: item.description,
  }));
  keyFindings.forEach((item) => addEvidence({
    icon: <LuInfo />,
    label: item.title,
    description: item.description,
  }));
  cautions.forEach((text) => addCaution(text));

  if (!evidence.length) {
    evidence.push({
      icon: <LuFileCheck />,
      label: '주요 위험항목 확인',
      description: '추가로 표시할 위험 근거가 없습니다.',
    });
  }

  return { evidence, cautions: cautionItems };
}

function reasonKey(text) {
  return String(text ?? '').replace(/\s+/g, '');
}

function normalizeReasonLabel(label) {
  if (/^주의사항\s*\d*$/i.test(label)) return '주의 필요';
  if (/시세|가격|매매|전세/.test(label)) return label;
  return label;
}

function recommendedActions(actions) {
  const items = actions
    .map((item) => (typeof item === 'string'
      ? { label: '', description: item }
      : { label: String(item?.label ?? ''), description: String(item?.description ?? '') }))
    .map((item) => ({ label: item.label.trim(), description: item.description.trim() }))
    .filter((item) => item.description || item.label)
    .map((item) => ({
      label: item.label || item.description,
      description: item.description || item.label,
    }));

  return items.length ? items : [{
    label: '계약 전 최종 확인',
    description: '계약 직전 최신 등기부등본과 보증 가입 가능 여부를 다시 확인하세요.',
  }];
}

function registryChecks(registry) {
  if (!registry) return [];

  const mortgages = registry.mortgages ?? [];
  const rows = [{
    key: 'mortgage',
    label: '근저당권',
    detail: mortgages.length
      ? mortgages.map((item) => `${item.holder ?? '권리자 미상'} (${money(numberOrNull(item.amount))})`).join(', ')
      : '없음',
    state: mortgages.length ? 'caution' : 'safe',
  }];

  REGISTRY_FLAGS.forEach(({ key, label }) => {
    const value = registry[key];
    rows.push({
      key,
      label,
      detail: value === 'TRUE' ? '확인됨' : value === 'FALSE' ? '없음' : '확인 필요',
      state: value === 'TRUE' ? 'risk' : value === 'FALSE' ? 'safe' : 'unknown',
    });
  });

  return rows.map((row) => ({
    ...row,
    statusLabel: registryStatus(row.state).label,
    statusIcon: registryStatus(row.state).icon,
  }));
}

function registryStatus(state) {
  if (state === 'safe') return { label: '안전', icon: <LuCircleCheck aria-hidden="true" /> };
  if (state === 'risk') return { label: '위험', icon: <LuTriangleAlert aria-hidden="true" /> };
  if (state === 'unknown') return { label: '확인 필요', icon: <LuCircleHelp aria-hidden="true" /> };
  return { label: '확인', icon: <LuCircleAlert aria-hidden="true" /> };
}

function registrySummary(items) {
  if (!items.length) return { label: '등기 정보 확인 필요', tone: 'unknown' };
  const riskCount = items.filter((item) => item.state === 'risk').length;
  const unknownCount = items.filter((item) => item.state === 'unknown').length;
  if (riskCount === 0 && unknownCount === 0) return { label: `${items.length}개 항목 모두 안전`, tone: 'safe' };
  return { label: `위험 ${riskCount} · 확인 필요 ${unknownCount}`, tone: riskCount > 0 ? 'risk' : 'unknown' };
}

function registryVerificationViewModel(value) {
  if (!value) return null;

  const owners = (value.currentOwners ?? []).map((owner) => (
    owner.share ? `${owner.name} (지분 ${owner.share})` : owner.name
  ));
  const addressMatch = REGISTRY_ADDRESS_MATCH[value.addressMatchStatus] ?? '확인 불가';
  const ownerMatch = REGISTRY_OWNER_MATCH[value.ownerMatchStatus] ?? '확인 불가';
  const watchlist = value.badLandlordMatched === true
    ? '명단 일치'
    : value.badLandlordMatched === false
      ? '조회 완료 · 일치 없음'
      : value.watchlistCheckStatus === 'ERROR'
        ? '조회 오류'
        : '확인 불가';
  const ownerChecks = (value.watchlistChecks ?? []).map((check) => {
    const target = check.ownerName || '소유자 미확인';
    const status = check.checkStatus === 'ERROR'
      ? '조회 오류'
      : check.checkStatus === 'NOT_CHECKED'
        ? '조회하지 못함'
        : WATCHLIST_MATCH_STATUS[check.matchStatus]
          ?? (check.matched === true ? '명단 일치' : check.matched === false ? '일치 없음' : '확인 불가');
    const matchType = WATCHLIST_MATCH_TYPE[check.matchType] ?? null;
    const checkedAt = check.checkStatus === 'NOT_CHECKED'
      ? null
      : registryCheckedAt(check.checkedAt);
    return [`${target}: ${status}`, matchType, checkedAt ? `${checkedAt} 조회` : null]
      .filter(Boolean)
      .join(' · ');
  });

  return {
    rows: [
      { label: '등기 문서 발급일', value: registryIssueDate(value.issueDate) },
      {
        label: '문서 판독',
        value: `${REGISTRY_PARSE_STATUS[value.parseStatus] ?? '확인 불가'} · 신뢰도 ${REGISTRY_CONFIDENCE[value.parseConfidence] ?? '확인 불가'}`,
      },
      { label: '등기부 주소', value: value.registryAddress || '판독 불가' },
      {
        label: '주소 일치',
        value: value.addressMatchReviewConfirmed
          ? `${addressMatch} · 사용자 확인 완료`
          : addressMatch,
      },
      { label: '현재 소유자', value: owners.length ? owners.join(', ') : '확인 불가' },
      {
        label: '계약 상대방과 소유자',
        value: `${value.contractPartyName || '계약 상대방 미입력'} · ${ownerMatch}`,
      },
      { label: '악성임대인 조회', value: watchlist },
      {
        label: '소유자별 조회',
        value: ownerChecks.length ? ownerChecks.join(', ') : '조회 내역 없음',
      },
    ],
    evidence: (value.rightEvidence ?? []).map((item, index) => ({
      key: `${item.section}-${item.rankNo}-${item.rightType}-${index}`,
      title: [
        REGISTRY_SECTION[item.section] ?? item.section,
        REGISTRY_RIGHT_TYPE[item.rightType] ?? item.rightType,
        item.rankNo ? `${item.rankNo}번` : null,
      ].filter(Boolean).join(' · '),
      detail: [
        registryRightStatus(item),
        item.holder ? `권리자 ${item.holder}` : null,
        item.debtor ? `채무자 ${item.debtor}` : null,
        item.amount == null ? null : money(item.amount),
      ].filter(Boolean).join(' · '),
      sources: (item.sources ?? []).map((source) => (
        `${source.fileName ? `${source.fileName} · ` : ''}${source.page}페이지`
      )).join(', ') || '근거 위치 확인 필요',
    })),
  };
}

function registryRightStatus(item) {
  if (item.rightType === 'CANCELLATION') return '말소 처리 이력';
  if (item.rightType === 'MORTGAGE_AMEND') return '근저당 변경 이력';
  if (item.rightType === 'MORTGAGE_TRANSFER') return '근저당 이전 이력';
  return item.status === 'CANCELLED' ? '말소됨' : '현재 유효';
}

function registryIssueDate(value) {
  if (!value) return '확인 불가';
  const [year, month, day] = String(value).split('-');
  return year && month && day
    ? `${year}. ${month}. ${day}.`
    : String(value);
}

function registryCheckedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function findMetric(data, sectionKey, metricKey) {
  return data.reportDetail?.sections?.find((section) => section.key === sectionKey)
    ?.metrics?.find((metric) => metric.key === metricKey);
}
