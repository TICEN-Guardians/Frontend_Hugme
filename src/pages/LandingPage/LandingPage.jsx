import { useState } from 'react';
import FeatureCarousel from './FeatureCarousel/FeatureCarousel.jsx';
import HeroSection from './HeroSection/HeroSection.jsx';
import styles from './LandingPage.module.css';

const SLIDES = [
  {
    id: 'risk',
    label: '① 매물 위험도 진단',
    title: '공공데이터로 계약 전 위험도 진단',
    heroTitle: ['공공데이터 기반 AI 진단으로', '계약 전 위험도를 확인하세요'],
    heroSubtitle: ['등기·시세·권리관계를 자동으로 분석해', '보증금 반환 위험을 미리 점검해드립니다'],
    primaryCtaLabel: '위험도 진단 시작',
    secondaryCtaLabel: '진단 흐름 보기',
    description: [
      '등기부등본, 실거래가, 권리관계를 불러와 위험 요소를 확인해요',
      '전세보증금 반환 가능성을 미리 점검하세요',
    ],
    image: '/images/landing/landing-feature-1.svg',
    to: '/risk/new',
  },
  {
    id: 'doc-chat',
    label: '② 서류안내 챗봇',
    title: '필요한 서류를 바로 안내받아요',
    heroTitle: ['계약 상황에 맞는 서류를', '챗봇이 바로 안내해요'],
    heroSubtitle: ['헷갈리는 준비 서류를 하나씩 확인하고', '지금 필요한 항목만 빠르게 정리하세요'],
    primaryCtaLabel: '서류 안내 받기',
    secondaryCtaLabel: '체크리스트 보기',
    description: ['계약에 필요한 서류를 챗봇이 안내하고', '준비 상태를 확인해드려요'],
    image: '/images/landing/landing-feature-2.svg',
    to: '/doc-chat',
  },
  {
    id: 'user-chat',
    label: '③ 조건상담 챗봇',
    title: '전세 조건, 챗봇에게 바로 물어보세요',
    heroTitle: ['내 전세 조건이 가능한지', '챗봇에게 바로 물어보세요'],
    heroSubtitle: ['보증 가입 조건과 예외 상황을 대화로 확인하고', '다음에 해야 할 일을 안내받을 수 있어요'],
    primaryCtaLabel: '조건 상담 시작',
    secondaryCtaLabel: '가입 조건 확인',
    description: ['계약 조건을 입력하면', '위험 여부를 바로 안내해드려요'],
    image: '/images/landing/landing-feature-3.svg',
    to: '/user-chat',
  },
  {
    id: 'checklist',
    label: '④ 체크리스트',
    title: '계약 전 확인할 항목을 한 번에',
    heroTitle: ['보증 가입 준비물을', '체크리스트로 한 번에 관리해요'],
    heroSubtitle: ['대출 여부와 상품 유형에 따라 달라지는 서류를', '놓치지 않도록 단계별로 확인하세요'],
    primaryCtaLabel: '체크리스트 열기',
    secondaryCtaLabel: '상품 목록 보기',
    description: ['놓치기 쉬운 확인 사항을', '체크리스트로 정리해드려요'],
    image: '/images/landing/landing-feature-4.svg',
    // TODO: 체크리스트는 상품(productCode)이 정해져야 이동 가능한 라우트라 우선 상품 목록으로 연결. 최종 목적지 확인 필요
    to: '/products',
  },
];

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const activeSlide = SLIDES[activeIndex];

  const paginate = (nextDirection) => {
    setDirection(nextDirection);
    setActiveIndex((prev) => {
      if (nextDirection > 0) {
        return prev === SLIDES.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? SLIDES.length - 1 : prev - 1;
    });
  };

  const goTo = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  return (
    <div className={styles.root}>
      <HeroSection slide={activeSlide} direction={direction} />
      <FeatureCarousel
        slides={SLIDES}
        activeIndex={activeIndex}
        direction={direction}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onGoTo={goTo}
      />
    </div>
  );
}
