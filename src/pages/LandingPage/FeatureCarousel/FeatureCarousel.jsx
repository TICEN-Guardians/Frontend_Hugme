import { useState } from 'react';
import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
import feature1 from '../../../assets/images/landing-feature-1.svg';
import feature2 from '../../../assets/images/landing-feature-2.svg';
import feature3 from '../../../assets/images/landing-feature-3.svg';
import feature4 from '../../../assets/images/landing-feature-4.svg';
import styles from './FeatureCarousel.module.css';

const SLIDES = [
  {
    id: 'risk',
    label: '① 매물 위험도 진단',
    title: '공공데이터로 계약 전 위험도 진단',
    description: [
      '등기부등본, 실거래가, 권리관계를 자동으로 불러와',
      '위험 요소를 한눈에 확인할 수 있어요',
      '전세보증금 반환 가능성을 미리 점검하세요',
    ],
    image: feature1,
    to: '/risk/new',
  },
  {
    id: 'doc-chat',
    label: '② 서류안내 챗봇',
    title: '필요한 서류를 바로 안내받아요',
    description: ['계약에 필요한 서류를 챗봇이 안내하고', '준비 상태를 확인해드려요'],
    image: feature2,
    to: '/doc-chat',
  },
  {
    id: 'user-chat',
    label: '③ 조건상담 챗봇',
    title: '전세 조건, 챗봇에게 바로 물어보세요',
    description: ['계약 조건을 입력하면', '위험 여부를 바로 안내해드려요'],
    image: feature3,
    to: '/user-chat',
  },
  {
    id: 'checklist',
    label: '④ 체크리스트',
    title: '계약 전 확인할 항목을 한 번에',
    description: ['놓치기 쉬운 확인 사항을', '체크리스트로 정리해드려요'],
    image: feature4,
    // TODO: 체크리스트는 상품(productCode)이 정해져야 이동 가능한 라우트라 우선 상품 목록으로 연결. 최종 목적지 확인 필요
    to: '/products',
  },
];

export default function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = SLIDES[activeIndex];

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.carousel}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={goPrev}
        aria-label="이전 슬라이드"
      >
        ‹
      </button>

      <div className={styles.slide}>
        <img
          className={styles.image}
          src={slide.image}
          alt={slide.title}
          width={420}
          height={290}
        />
        <div className={styles.content}>
          <div className={styles.label}>{slide.label}</div>
          <h2 className={styles.featureTitle}>{slide.title}</h2>
          <p className={styles.description}>
            {slide.description.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <Link
            to={slide.to}
            className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.sm} ${styles.cta}`}
          >
            🔒 로그인하고 진단
          </Link>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={goNext}
        aria-label="다음 슬라이드"
      >
        ›
      </button>

      <div className={styles.dots}>
        {SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`${index + 1}번째 슬라이드로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
