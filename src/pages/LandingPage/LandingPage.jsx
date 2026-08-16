import { useState } from 'react';
import FeatureCarousel from './FeatureCarousel/FeatureCarousel.jsx';
import HeroSection from './HeroSection/HeroSection.jsx';
import styles from './LandingPage.module.css';

const SLIDES = [
  {
    id: 'risk',
    label: '① 매물 위험도 진단',
    title: '여러 정보를 분석해 매물의 위험 신호를 확인해요',
    heroTitle: ['계약하기 전,', '이 집의 위험 요소를 먼저 확인하세요'],
    heroSubtitle: [
      '등기부등본 등 매물 정보를 바탕으로',
      '계약 전에 확인해야 할 여러 위험 요소를 분석해드려요',
    ],
    primaryCtaLabel: '매물 위험도 진단하기',
    heroNote: '로그인 후 이용 가능',
    description: [
      '입력한 매물 정보를 바탕으로',
      '계약 전에 확인해야 할 여러 위험 요소와 진단 결과를 보여드려요',
    ],
    featurePoints: ['매물 정보 분석', '여러 위험 요소 진단', '종합 결과 제공'],
    cardCtaLabel: '로그인하고 진단하기',
    image: '/images/landing/Carousel1.png',
    to: '/risk/new',
  },
  {
    id: 'doc-chat',
    label: '② 서류안내 챗봇',
    title: '필요한 서류에 대해 자세하게 질문해보세요',
    heroTitle: ['궁금한 서류가 있다면,', '챗봇에게 바로 물어보세요'],
    heroSubtitle: [
      '준비해야 할 서류에 대해 궁금한 내용을',
      '대화하면서 자세하게 안내받을 수 있어요',
    ],
    primaryCtaLabel: '서류 질문하기',
    secondaryCtaLabel: '체크리스트 보기',
    heroNote: '로그인 후 이용 가능',
    description: [
      '특정 서류가 무엇인지 궁금하거나 추가로 확인하고 싶은 내용을',
      '챗봇과 대화하며 계속 질문할 수 있어요',
    ],
    featurePoints: ['서류별 상세 안내', '궁금한 내용 추가 질문', '대화로 계속 확인'],
    cardCtaLabel: '로그인하고 질문하기',
    image: '/images/landing/Carousel2.png',
    to: '/doc-chat',
  },
  {
    id: 'user-chat',
    label: '③ 조건상담 챗봇',
    title: '내 조건으로 보증 가입이 가능한지 확인해요',
    heroTitle: ['내 조건으로 HUG 보증 가입이 가능한지', '챗봇에게 바로 물어보세요'],
    heroSubtitle: [
      '내 상황과 조건을 바탕으로',
      'HUG 보증 가입 가능 여부를 대화로 확인할 수 있어요',
    ],
    primaryCtaLabel: '조건 상담 시작',
    secondaryCtaLabel: '보증 조건 알아보기',
    heroNote: '로그인 없이 바로 조건상담 챗봇을 사용할 수 있어요',
    description: [
      '내 상황과 조건을 바탕으로',
      'HUG 보증 가입 가능 여부에 대해 챗봇과 상담할 수 있어요',
    ],
    cardCtaLabel: '로그인 없이 상담하기',
    image: '/images/landing/landing-feature-3.svg',
    to: '/user-chat',
  },
  {
    id: 'checklist',
    label: '④ 보증 준비 체크리스트',
    title: '기본 서류부터 내 계약에 필요한 서류까지 확인해요',
    heroTitle: ['내가 준비해야 할 서류를', '체크리스트로 확인하세요'],
    heroSubtitle: [
      '기본 준비 서류를 바로 확인하고,',
      '로그인하면 임대차계약서를 바탕으로 필요한 서류만 확인할 수 있어요',
    ],
    primaryCtaLabel: '체크리스트 확인',
    secondaryCtaLabel: '맞춤 서류 확인',
    heroNote:
      '기본 체크리스트는 로그인 없이 사용할 수 있으며, 임대차계약서 기반 맞춤 확인은 로그인이 필요해요',
    description: [
      '기본 체크리스트와 서류 정보를 확인하고,',
      '로그인하면 임대차계약서를 바탕으로 내게 필요한 서류만 확인할 수 있어요',
    ],
    cardCtaLabel: '기본 체크리스트 보기',
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
