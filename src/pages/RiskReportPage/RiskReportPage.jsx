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
import styles from './RiskReportPage.module.css';

// 실제 리포트 조회 API가 없어서, 화면에 보이는 그대로 평평한 mock 객체로 둔다.
// reportId(useParams)는 아직 아무 데도 안 쓰인다 — 리포트가 항상 이 mock 하나뿐이라서다.
const MOCK_REPORT = {
  title: '전세보증금 안전 진단 리포트',
  badgeLabel: '⚠️ 주의',
  badgeTone: 'warning',
  address: '서울특별시 강남구 테헤란로 123, 101동 1203호',
  housingType: '아파트',
  summary:
    'AI 분석과 등기부 정보, 담보 안전성 등을 종합적으로 검토한 결과, 전세보증금 반환 위험이 다소 높아 주의가 필요합니다.',
  totalScore: 68,
  maxScore: 100,
  subScores: [
    { label: '계약가격 위험', score: 15, max: 25 },
    { label: '담보 위험', score: 18, max: 25 },
    { label: '등기부 위험', score: 7, max: 25 },
    { label: '임대인 위험', score: 2, max: 25 },
  ],
  keyStats: [
    { icon: '🏠', label: 'AI 예상 매매가', value: '3.0억 원' },
    { icon: '🏡', label: 'AI 예상 전세가', value: '1.7억 원' },
    { icon: '🔒', label: '계약 보증금', value: '2.0억 원' },
    { icon: '🛡️', label: '등기부상 채권최고액', value: '0.5억 원' },
  ],
  priceComparison: {
    bars: [
      { label: 'AI 예상 매매가격', value: '3.0억', heightRatio: 1, tone: 'Neutral' },
      { label: '계약 예정 보증금', value: '2.0억', heightRatio: 0.667, tone: 'Accent' },
      { label: 'AI 예상 전세가격', value: '1.7억', heightRatio: 0.567, tone: 'Success' },
    ],
    diffs: [
      { label: '계약 보증금은 AI 예상 전세시세보다', value: '+3,000만 높습니다.' },
      { label: '상승률', value: '+17.6%' },
    ],
  },
  collateral: {
    burdenRateLabel: '담보부담율 83.3%',
    segments: [
      { label: '근저당', amount: '0.5억', ratio: 16.7, tone: 'Danger' },
      { label: '보증금', amount: '2.0억', ratio: 66.7, tone: 'Accent' },
      { label: '잔여 여력', amount: '0.5억', ratio: 16.7, tone: 'Success' },
    ],
    description:
      '담보부담률이 83.3%로 높은 편입니다. 보증금 보호 여력이 제한적이므로 유의가 필요합니다.',
  },
  midStats: [
    { label: '예상 전세시세 대비', value: '+17.6%', valueTone: 'danger' },
    { label: '매매가 대비 보증금', value: '66.7%' },
    { label: '잔여 담보여력', value: '5,000만원' },
  ],
  modelFactors: [
    { label: '전용면적', percent: 28 },
    { label: '지역 가격수준', percent: 24 },
    { label: '단지 특성', percent: 20 },
    { label: '건축연령', percent: 16 },
    { label: '금리 수준', percent: 12 },
  ],
  refundChecks: [
    { label: '전세권 등기 없음', status: '✓ 양호', tone: 'Success' },
    { label: '선순위 관리금액 있음', status: '⚠ 주의', tone: 'Warning' },
    { label: '신탁 등기 없음', status: '✓ 양호', tone: 'Success' },
    { label: '경매 진행 없음', status: '✓ 양호', tone: 'Success' },
    { label: '반환 위험 보통 이상', status: '⚠ 보통', tone: 'Warning' },
  ],
  riskReasons: [
    { icon: '💰', label: '계약가격', description: 'AI 예상 전세시세보다 높은 계약' },
    { icon: '🛡️', label: '담보 안전성', description: '담보부담율이 높은 수준' },
    { icon: '📄', label: '등기부 상태', description: '압류·경매 등은 확인되지 않음' },
  ],
  recommendedActions: [
    {
      icon: '👤',
      title: '보증금 규모 재협상 검토',
      description: 'AI 시세 및 담보여력을 고려하여 보증금 조정 여부를 검토하세요.',
    },
    {
      icon: '📋',
      title: '선순위 채권 상세 확인',
      description: '근저당권의 설정일, 금액, 말소 조건을 반드시 확인하세요.',
    },
    {
      icon: '🛡️',
      title: '보증보험 가입조건 동시 체크',
      description: '보증보험 가입 가능 여부와 보증한도를 사전에 확인하세요.',
    },
  ],
};

export default function RiskReportPage() {
  const report = MOCK_REPORT;

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <RiskSummaryCard
            title={report.title}
            badgeLabel={report.badgeLabel}
            badgeTone={report.badgeTone}
            address={report.address}
            housingType={report.housingType}
            description={report.summary}
          />
          <RiskScoreCard
            score={report.totalScore}
            maxScore={report.maxScore}
            subScores={report.subScores}
          />
        </div>

        <div className={styles.statGrid}>
          {report.keyStats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className={styles.twoColRow}>
          <PriceComparisonChart title="AI 시세 · 계약 비교" {...report.priceComparison} />
          <CollateralBar title="담보 안전성 분석" {...report.collateral} />
        </div>

        <MetricSummary metrics={report.midStats} />

        <div className={styles.twoColRow}>
          <ModelFactorList title="모델 분석 요약" factors={report.modelFactors} />
          <ReturnabilityCheck title="보증금 반환 가능성 체크" items={report.refundChecks} />
        </div>

        <div className={styles.twoColRow}>
          <RiskEvidenceCards title="주요 리스크 근거" reasons={report.riskReasons} />
          <RecommendedActions title="권장 조치" actions={report.recommendedActions} />
        </div>

        <p className={styles.disclaimer}>
          본 리포트는 AI 분석 기반의 참고 자료이며, 실제 계약 전 반드시 전문가의 검토를 받으시기
          바랍니다.
        </p>
      </div>
    </div>
  );
}
