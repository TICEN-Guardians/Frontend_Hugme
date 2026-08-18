import { useEffect, useState } from 'react';
import { FaClipboardCheck, FaFileLines, FaHouse, FaHouseChimney, FaShieldHalved, FaWonSign } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import CollateralBar from '../../components/risk/CollateralBar/CollateralBar.jsx';
import MetricSummary from '../../components/risk/MetricSummary/MetricSummary.jsx';
import ModelFactorList from '../../components/risk/ModelFactorList/ModelFactorList.jsx';
import PriceComparisonChart from '../../components/risk/PriceComparisonChart/PriceComparisonChart.jsx';
import RecommendedActions from '../../components/risk/RecommendedActions/RecommendedActions.jsx';
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
const money = (value) => value == null ? '확인 필요' : `${Number(value).toLocaleString('ko-KR')}원`;
const ratio = (value) => value == null ? '확인 필요' : `${Number(value).toFixed(2)}%`;

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
        <div className={styles.topRow}>
          <RiskSummaryCard title={view.title} badgeLabel={view.badgeLabel} badgeTone={view.badgeTone}
            address={view.address} housingType={view.housingType} description={view.summary} />
          <RiskScoreCard score={view.totalScore} maxScore={100} subScores={view.subScores} />
        </div>
        <div className={styles.statGrid}>{view.keyStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
        <div className={styles.twoColRow}>
          <PriceComparisonChart title="AI 시세·계약 비교" {...view.priceComparison} />
          <CollateralBar title="담보 안전성 분석" {...view.collateral} />
        </div>
        <MetricSummary metrics={view.midStats} />
        <div className={styles.twoColRow}>
          <ModelFactorList title="위험점수 구성" factors={view.modelFactors} />
          <ReturnabilityCheck title="필수 확인사항" items={view.refundChecks} />
        </div>
        <div className={styles.twoColRow}>
          <RiskEvidenceCards title="주요 위험 근거" reasons={view.riskReasons} />
          <RecommendedActions title="권장 조치" actions={view.recommendedActions} />
        </div>
        <p className={styles.disclaimer}>본 리포트는 AI와 규칙 기반 분석을 이용한 참고자료이며, 계약 전 최신 등기부와 전문가 검토가 필요합니다.</p>
      </div>
    </div>
  );
}

function ReportState({ message }) {
  return <div className={styles.root}><div className={`${styles.stateCard} container`}>{message}</div></div>;
}

function toViewModel(data) {
  const grade = GRADE[data.risk.grade] ?? GRADE.MEDIUM;
  const sale = data.valuation.estimatedSalePrice;
  const lease = data.valuation.estimatedLeasePrice;
  const depositMetric = findMetric(data, 'collateral', 'deposit');
  const deposit = Number(depositMetric?.value ?? 0);
  const burden = Number(data.indicators.collateralBurdenAmount ?? 0);
  const mortgage = Math.max(burden - deposit, 0);
  const remaining = Math.max(Number(data.indicators.remainingCollateralCapacity ?? 0), 0);
  const maxPrice = Math.max(sale, deposit, lease, 1);
  const total = Math.max(sale, 1);
  const notices = data.reportDetail.notices ?? [];
  const explanation = data.reportDetail.explanation;

  return {
    title: data.reportDetail.title,
    badgeLabel: grade.label,
    badgeTone: grade.tone,
    address: data.property.normalizedAddress,
    housingType: HOUSING[data.property.housingType] ?? data.property.housingType,
    summary: explanation.summary,
    totalScore: data.risk.score,
    subScores: [
      { label: '깡통전세 위험', score: data.risk.breakdown.underwater, max: 47 },
      { label: '역전세 위험', score: data.risk.breakdown.rollover, max: 35 },
      { label: '주택 특성', score: data.risk.breakdown.property, max: 10 },
      { label: '시장 상황', score: data.risk.breakdown.market, max: 8 },
    ],
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
        { label: '전세가율', value: ratio(data.indicators.leaseToSaleRate) },
      ],
    },
    collateral: {
      burdenRateLabel: `담보부담률 ${ratio(data.indicators.collateralBurdenRate)}`,
      segments: [
        { label: '근저당', amount: money(mortgage), ratio: Math.min((mortgage / total) * 100, 100).toFixed(1), tone: 'Danger' },
        { label: '보증금', amount: money(deposit), ratio: Math.min((deposit / total) * 100, 100).toFixed(1), tone: 'Accent' },
        { label: '잔여 담보여력', amount: money(remaining), ratio: Math.min((remaining / total) * 100, 100).toFixed(1), tone: 'Success' },
      ],
      description: `현재 담보부담률은 ${ratio(data.indicators.collateralBurdenRate)}이며, 매매가 20% 하락 시 ${scenarioRate(data, 20)}입니다.`,
    },
    midStats: [
      { label: '전세가율', value: ratio(data.indicators.leaseToSaleRate) },
      { label: '담보부담률', value: ratio(data.indicators.collateralBurdenRate) },
      { label: '보증금 부족액', value: money(data.indicators.depositShortfall), valueTone: data.indicators.depositShortfall > 0 ? 'danger' : undefined },
      { label: '시세 신뢰도', value: data.valuationReliability },
    ],
    modelFactors: [
      { label: '깡통전세 위험', percent: Math.round((data.risk.breakdown.underwater / 47) * 100) },
      { label: '역전세 위험', percent: Math.round((data.risk.breakdown.rollover / 35) * 100) },
      { label: '주택 특성', percent: Math.round((data.risk.breakdown.property / 10) * 100) },
      { label: '시장 상황', percent: Math.round((data.risk.breakdown.market / 8) * 100) },
    ],
    refundChecks: [
      ...notices.map((item) => ({ label: item.title, status: '주의', tone: 'Warning' })),
      ...(data.missingChecks ?? []).map((code) => ({ label: code, status: '확인 필요', tone: 'Warning' })),
      ...(!notices.length && !data.missingChecks?.length ? [{ label: '필수 위험항목 확인', status: '완료', tone: 'Success' }] : []),
    ],
    riskReasons: notices.length
      ? notices.map((item) => ({ icon: <FaFileLines />, label: item.title, description: item.description }))
      : explanation.keyFindings.slice(0, 3).map((text, index) => ({ icon: <FaClipboardCheck />, label: `분석 결과 ${index + 1}`, description: text })),
    recommendedActions: explanation.recommendedActions.map((text, index) => ({
      icon: index === 0 ? <FaFileLines /> : <FaShieldHalved />, title: `권장 조치 ${index + 1}`, description: text,
    })),
  };
}

function findMetric(data, sectionKey, metricKey) {
  return data.reportDetail.sections?.find((section) => section.key === sectionKey)
    ?.metrics?.find((metric) => metric.key === metricKey);
}

function scenarioRate(data, dropRate) {
  return ratio(data.reportDetail.priceScenarios?.find((item) => item.priceDropRate === dropRate)?.collateralBurdenRate);
}
