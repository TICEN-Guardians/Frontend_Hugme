import { useEffect, useState } from 'react';
import {
  FaBuilding,
  FaChartLine,
  FaCircleInfo,
  FaClipboardCheck,
  FaFileLines,
  FaHouse,
  FaHouseChimney,
  FaRotate,
  FaScaleBalanced,
  FaShieldHalved,
  FaWonSign,
} from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import CollateralBar from '../../components/risk/CollateralBar/CollateralBar.jsx';
import MetricSummary from '../../components/risk/MetricSummary/MetricSummary.jsx';
import ModelFactorList from '../../components/risk/ModelFactorList/ModelFactorList.jsx';
import PriceComparisonChart from '../../components/risk/PriceComparisonChart/PriceComparisonChart.jsx';
import PriceScenarioTable from '../../components/risk/PriceScenarioTable/PriceScenarioTable.jsx';
import RecommendedActions from '../../components/risk/RecommendedActions/RecommendedActions.jsx';
import RegistrySafety from '../../components/risk/RegistrySafety/RegistrySafety.jsx';
import ReturnabilityCheck from '../../components/risk/ReturnabilityCheck/ReturnabilityCheck.jsx';
import RiskEvidenceCards from '../../components/risk/RiskEvidenceCards/RiskEvidenceCards.jsx';
import RiskScoreCard from '../../components/risk/RiskScoreCard/RiskScoreCard.jsx';
import RiskSummaryCard from '../../components/risk/RiskSummaryCard/RiskSummaryCard.jsx';
import StatCard from '../../components/risk/StatCard/StatCard.jsx';
import { getDiagnosis } from '../../services/propertyRisk/propertyRiskService.js';
import styles from './RiskReportPage.module.css';

const GRADE = {
  LOW: { label: '낮음', tone: 'success' }, MEDIUM: { label: '보통', tone: 'warning' },
  HIGH: { label: '높음', tone: 'danger' }, CRITICAL: { label: '매우 높음', tone: 'danger' },
};
const HOUSING = { APARTMENT: '아파트', VILLA: '연립·다세대', OFFICETEL: '오피스텔', DETACHED_MULTI: '단독·다가구' };
const SEVERITY_TONE = { CRITICAL: 'Danger', HIGH: 'Warning', INFO: 'Info' };
const SEVERITY_STATUS = { CRITICAL: '위험', HIGH: '주의', INFO: '확인 필요' };
const VERDICT = {
  SAFE: { label: '안전', tone: 'safe' },
  CAUTION: { label: '주의', tone: 'caution' },
  RISK: { label: '위험', tone: 'risk' },
};
// 등기부 권리관계 표시 순서. TriState(TRUE/FALSE/UNKNOWN)를 그대로 받아 화면 문구만 만든다.
const REGISTRY_FLAGS = [
  { key: 'seizure', label: '압류' },
  { key: 'provisionalSeizure', label: '가압류' },
  { key: 'provisionalDisposition', label: '가처분' },
  { key: 'auctionCommenced', label: '경매개시' },
  { key: 'trustRegistration', label: '신탁등기' },
  { key: 'jeonseRight', label: '선순위 전세권' },
  { key: 'leaseholdRegistration', label: '임차권등기' },
];
const money = (value) => value == null ? '확인 필요' : `${Number(value).toLocaleString('ko-KR')}원`;
const ratio = (value) => value == null ? '확인 필요' : `${Number(value).toFixed(2)}%`;
const dateTime = (value) => value == null ? '' : new Date(value).toLocaleString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
});

export default function RiskReportPage() {
  const { reportId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDiagnosis(reportId)
      .then((result) => active && setData(result))
      .catch((requestError) => active && setError(
        requestError?.response?.data?.message ?? '진단 결과를 불러오지 못했습니다.',
      ));
    return () => { active = false; };
  }, [reportId]);

  if (error) return <ReportState message={error} />;
  if (!data) return <ReportState message="진단 결과를 불러오고 있습니다." />;

  const view = toViewModel(data);
  return (
    <div className={styles.root}>
      <div className={`${styles.content} container`}>
        <RiskSummaryCard title={view.title} badgeLabel={view.badgeLabel} badgeTone={view.badgeTone}
          address={view.address} housingType={view.housingType} analyzedAt={view.analyzedAt} />

        <div className={styles.overviewRow}>
          <RiskScoreCard score={view.totalScore} maxScore={view.maxScore} tone={view.badgeTone}
            gradeLabel={view.badgeLabel} note={view.scoreNote} />
          <SummaryPanel title="AI 분석 요약" text={view.summary} notes={view.basisNotes} />
          <ModelFactorList title="위험점수 기여도" factors={view.contribution} />
        </div>

        <SectionHeading index={1} title="핵심 지표" />
        <div className={styles.statGrid}>{view.keyStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
        <MetricSummary metrics={view.midStats} />

        <SectionHeading index={2} title="시세·계약 비교 및 하락 시나리오" />
        <div className={styles.twoColRow}>
          <PriceComparisonChart title="AI 시세·계약 비교" {...view.priceComparison} />
          <PriceScenarioTable title="가격 하락 시나리오" rows={view.scenarios} note={view.scenarioNote} />
        </div>

        <SectionHeading index={3} title="등기부·담보 안전성 분석" />
        <div className={styles.twoColRow}>
          <CollateralBar title="근저당·담보 구성" {...view.collateral} />
          <RegistrySafety title="등기부 권리관계" items={view.registryChecks}
            emptyMessage="등기부 상세 정보를 불러오지 못했습니다." />
        </div>

        <SectionHeading index={4} title="핵심 분석 인사이트" />
        <div className={styles.twoColRow}>
          <RiskEvidenceCards title="주요 분석 근거" reasons={view.riskReasons} />
          <ReturnabilityCheck title="필수 확인사항" items={view.refundChecks} />
        </div>

        <SectionHeading index={5} title="계약 전 권장 조치" />
        <RecommendedActions title="계약 전 확인하면 좋은 것들" actions={view.recommendedActions} />

        <p className={styles.disclaimer}>본 리포트는 AI와 규칙 기반 분석을 이용한 참고자료이며, 계약 전 최신 등기부와 전문가 검토가 필요합니다.</p>
      </div>
    </div>
  );
}

function SummaryPanel({ title, text, notes }) {
  return (
    <div className={styles.summaryPanel}>
      <p className={styles.summaryTitle}>
        {title} <FaCircleInfo aria-hidden="true" />
      </p>
      <p className={styles.summaryText}>{text}</p>
      {notes.map((note) => (
        <p key={note} className={styles.summaryNote}>
          <FaCircleInfo aria-hidden="true" /> {note}
        </p>
      ))}
    </div>
  );
}

function SectionHeading({ index, title }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.sectionIndex}>{index}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
  );
}

function ReportState({ message }) {
  return <div className={styles.root}><div className={`${styles.stateCard} container`}>{message}</div></div>;
}

function toViewModel(data) {
  const risk = data.risk ?? {};
  const breakdown = risk.breakdown ?? {};
  const valuation = data.valuation ?? {};
  const property = data.property ?? {};
  const indicators = data.indicators ?? {};
  const reportDetail = data.reportDetail ?? {};
  const explanation = reportDetail.explanation ?? {};

  const grade = GRADE[risk.grade] ?? GRADE.MEDIUM;
  const sale = Number(valuation.estimatedSalePrice ?? 0);
  const lease = Number(valuation.estimatedLeasePrice ?? 0);
  const depositMetric = findMetric(data, 'collateral', 'deposit');
  const deposit = Number(depositMetric?.value ?? 0);
  const burden = Number(indicators.collateralBurdenAmount ?? 0);
  const mortgage = Math.max(burden - deposit, 0);
  const remaining = Math.max(Number(indicators.remainingCollateralCapacity ?? 0), 0);
  const maxPrice = Math.max(sale, deposit, lease, 1);
  const total = Math.max(sale, 1);
  const notices = reportDetail.notices ?? [];
  const riskNotices = notices.filter((item) => item.severity !== 'INFO');
  const keyFindings = explanation.keyFindings ?? [];
  const recommendedActions = explanation.recommendedActions ?? [];
  const priceScenarios = reportDetail.priceScenarios ?? [];
  const weights = risk.weights ?? {};
  const basisNotes = [
    risk.gradeOverridden
      && '등기부에서 확인된 위험사항 때문에 점수와 별개로 등급이 상향됐습니다.',
    risk.provisionalCollateralBasis
      && '근저당 채권최고액을 확정하지 못해 담보부담률 대신 전세가율을 기준으로 산정했습니다.',
  ].filter(Boolean);

  return {
    title: reportDetail.title,
    badgeLabel: grade.label,
    badgeTone: grade.tone,
    address: property.normalizedAddress,
    housingType: HOUSING[property.housingType] ?? property.housingType,
    summary: explanation.summary,
    analyzedAt: dateTime(data.analyzedAt),
    totalScore: risk.score,
    maxScore: weights.total ?? 100,
    scoreNote: risk.gradeOverridden ? '위험사항으로 등급 상향' : null,
    basisNotes,
    contribution: [
      { icon: <FaScaleBalanced />, label: '깡통전세 위험', score: breakdown.underwater ?? 0, max: weights.underwater },
      { icon: <FaRotate />, label: '역전세 위험', score: breakdown.rollover ?? 0, max: weights.rollover },
      { icon: <FaBuilding />, label: '주택 특성', score: breakdown.property ?? 0, max: weights.property },
      { icon: <FaChartLine />, label: '시장 상황', score: breakdown.market ?? 0, max: weights.market },
    ].filter((item) => item.max),
    keyStats: [
      { icon: <FaHouse />, label: 'AI 예상 매매가', value: money(sale) },
      { icon: <FaHouseChimney />, label: 'AI 예상 전세가', value: money(lease) },
      { icon: <FaWonSign />, label: '계약 보증금', value: money(deposit) },
      { icon: <FaShieldHalved />, label: '담보부담액', value: money(burden) },
    ],
    priceComparison: {
      bars: [
        { label: '예상 매매가', value: money(sale), heightRatio: sale / maxPrice, tone: 'Neutral' },
        { label: '계약 보증금', value: money(deposit), heightRatio: deposit / maxPrice, tone: 'Accent' },
        { label: '예상 전세가', value: money(lease), heightRatio: lease / maxPrice, tone: 'Success' },
      ],
      diffs: [
        { label: '예상 전세가 대비 계약 보증금 차이', value: money(deposit - lease) },
        { label: '전세가율', value: ratio(indicators.leaseToSaleRate) },
      ],
    },
    scenarios: priceScenarios.map((item) => ({
      label: item.label,
      price: money(item.estimatedSalePrice),
      rate: ratio(item.collateralBurdenRate),
      verdictLabel: VERDICT[item.verdict]?.label ?? '확인 필요',
      verdictTone: VERDICT[item.verdict]?.tone ?? 'caution',
    })),
    scenarioNote: scenarioNote(priceScenarios),
    registryChecks: registryChecks(data.registry),
    collateral: {
      burdenRateLabel: `담보부담률 ${ratio(indicators.collateralBurdenRate)}`,
      segments: [
        { label: '근저당', amount: money(mortgage), ratio: Math.min((mortgage / total) * 100, 100).toFixed(1), tone: 'Danger' },
        { label: '보증금', amount: money(deposit), ratio: Math.min((deposit / total) * 100, 100).toFixed(1), tone: 'Accent' },
        { label: '잔여 담보여력', amount: money(remaining), ratio: Math.min((remaining / total) * 100, 100).toFixed(1), tone: 'Success' },
      ],
      description: `현재 담보부담률은 ${ratio(indicators.collateralBurdenRate)}이며, 매매가 20% 하락 시 ${scenarioRate(data, 20)}입니다.`,
    },
    midStats: [
      { label: '전세가율', value: ratio(indicators.leaseToSaleRate) },
      { label: '담보부담률', value: ratio(indicators.collateralBurdenRate) },
      { label: '보증금 부족액', value: money(indicators.depositShortfall), valueTone: indicators.depositShortfall > 0 ? 'danger' : undefined },
      { label: '시세 신뢰도', value: data.valuationReliability },
    ],
    refundChecks: notices.length
      ? notices.map((item) => ({
        key: item.code,
        label: item.title,
        status: SEVERITY_STATUS[item.severity] ?? '주의',
        tone: SEVERITY_TONE[item.severity] ?? 'Warning',
      }))
      : [{ key: 'ALL_CLEAR', label: '필수 위험항목 확인', status: '완료', tone: 'Success' }],
    riskReasons: riskNotices.length
      ? riskNotices.map((item) => ({ icon: <FaFileLines />, label: item.title, description: item.description }))
      : keyFindings.slice(0, 3).map((item) => ({ icon: <FaClipboardCheck />, label: item.title, description: item.description })),
    recommendedActions: recommendedActions.map((text, index) => ({
      icon: index === 0 ? <FaFileLines /> : <FaShieldHalved />, title: `권장 조치 ${index + 1}`, description: text,
    })),
  };
}

function registryChecks(registry) {
  if (!registry) return [];

  const mortgages = registry.mortgages ?? [];
  const mortgageRow = {
    key: 'mortgage',
    label: '근저당권',
    detail: mortgages.length
      ? mortgages.map((item) => `${item.holder ?? '권리자 미상'} (${money(item.amount)})`).join(', ')
      : '없음',
    state: mortgages.length ? 'caution' : 'safe',
  };

  const flagRows = REGISTRY_FLAGS.map(({ key, label }) => {
    const value = registry[key];
    return {
      key,
      label,
      detail: value === 'TRUE' ? '확인됨' : value === 'FALSE' ? '없음' : '확인 못함',
      state: value === 'TRUE' ? 'risk' : value === 'FALSE' ? 'safe' : 'unknown',
    };
  });

  return [mortgageRow, ...flagRows];
}

function scenarioNote(scenarios) {
  const worst = scenarios[scenarios.length - 1];
  if (!worst) return '';

  const verdict = VERDICT[worst.verdict]?.label ?? '확인 필요';
  return `${worst.label} 시 담보부담률은 ${ratio(worst.collateralBurdenRate)}로 ${verdict} 수준입니다.`;
}

function findMetric(data, sectionKey, metricKey) {
  return data.reportDetail?.sections?.find((section) => section.key === sectionKey)
    ?.metrics?.find((metric) => metric.key === metricKey);
}

function scenarioRate(data, dropRate) {
  return ratio(data.reportDetail?.priceScenarios?.find((item) => item.priceDropRate === dropRate)?.collateralBurdenRate);
}
