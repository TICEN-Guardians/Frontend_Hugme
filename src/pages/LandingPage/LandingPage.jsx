import { useState } from 'react';
import { useAuth } from '../../context/auth/AuthContext.jsx';
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
    to: '/auth/login',
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
    to: '/auth/login',
  },
  {
    id: 'user-chat',
    label: '③ 조건상담 챗봇',
    title: '내 조건으로 HUG 보증 가입이 가능한지 상담해보세요',
    heroTitle: ['내 조건으로 HUG 보증 가입이 가능한지', '챗봇에게 바로 물어보세요'],
    heroSubtitle: [
      '내 상황과 조건을 바탕으로',
      'HUG 보증 가입 가능 여부를 대화로 확인할 수 있어요',
    ],
    primaryCtaLabel: '조건 상담 시작',
    secondaryCtaLabel: '보증 조건 알아보기',
    heroNote: '로그인 없이 바로 이용 가능',
    description: [
      '보증금, 전세가율 등 내 상황과 조건을 바탕으로',
      '챗봇과 대화하며 가입 가능 여부를 확인할 수 있어요',
    ],
    featurePoints: ['가입 가능 여부 상담', '조건별 추가 질문', '로그인 없이 바로 이용'],
    cardCtaLabel: '바로 상담하기',
    image: '/images/landing/Carousel3.png',
    to: '/user-chat',
  },
  {
    id: 'checklist',
    label: '④ 체크리스트',
    title: '내 계약에 필요한 서류를 한눈에 확인하세요',
    heroTitle: ['내가 준비해야 할 서류를', '체크리스트로 확인하세요'],
    heroSubtitle: [
      '기본 준비 서류를 바로 확인하고,',
      '로그인하면 임대차계약서를 바탕으로 필요한 서류만 확인할 수 있어요',
    ],
    primaryCtaLabel: '체크리스트 확인',
    secondaryCtaLabel: '맞춤 서류 확인',
    heroNote: '기본 체크리스트 바로 이용 · 맞춤 서류 확인은 로그인 필요',
    description: [
      '기본 준비 서류를 확인하고,',
      '로그인하면 임대차계약서를 바탕으로 내게 필요한 서류만 확인할 수 있어요',
    ],
    featurePoints: ['기본 준비 서류 확인', '서류별 상세 정보 제공', '계약서 기반 맞춤 서류 확인'],
    cardCtaLabel: '체크리스트 확인하기',
    image: '/images/landing/Carousel4.png',
    to: '/guarantee-checklist',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const slides = SLIDES.map((slide) => {
    if (slide.id === 'risk') {
      return {
        ...slide,
        heroNote: isAuthenticated ? '바로 진단을 시작해보세요' : '로그인 후 이용 가능',
        cardCtaLabel: isAuthenticated ? '매물 진단 시작하기' : '로그인하고 진단하기',
        to: isAuthenticated ? '/risk/new' : '/auth/login',
      };
    }

    if (slide.id === 'doc-chat') {
      return {
        ...slide,
        heroNote: isAuthenticated ? '궁금한 서류를 바로 질문해보세요' : '로그인 후 이용 가능',
        cardCtaLabel: isAuthenticated ? '서류 챗봇 시작하기' : '로그인하고 질문하기',
        to: isAuthenticated ? '/doc-chat' : '/auth/login',
      };
    }

    if (slide.id === 'user-chat') {
      return {
        ...slide,
        heroNote: isAuthenticated ? '내 조건으로 바로 상담해보세요' : '로그인 없이 바로 이용 가능',
        featurePoints: isAuthenticated
          ? ['가입 가능 여부 상담', '조건별 추가 질문', '바로 상담 가능']
          : slide.featurePoints,
      };
    }

    if (slide.id === 'checklist') {
      return {
        ...slide,
        heroSubtitle: isAuthenticated
          ? ['기본 준비 서류를 바로 확인하고,', '상세 체크리스트에서 필요한 서류를 살펴볼 수 있어요']
          : slide.heroSubtitle,
        description: isAuthenticated
          ? ['기본 준비 서류를 확인하고,', '상세 체크리스트에서 필요한 항목을 바로 살펴볼 수 있어요']
          : slide.description,
        heroNote: isAuthenticated ? '내 계약에 필요한 서류를 확인해보세요' : '기본 체크리스트 바로 이용',
      };
    }

    return slide;
  });
  const activeSlide = slides[activeIndex];

  const paginate = (nextDirection) => {
    setDirection(nextDirection);
    setActiveIndex((prev) => {
      if (nextDirection > 0) {
        return prev === slides.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? slides.length - 1 : prev - 1;
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
        slides={slides}
        activeIndex={activeIndex}
        direction={direction}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onGoTo={goTo}
      />
    </div>
  );
}
