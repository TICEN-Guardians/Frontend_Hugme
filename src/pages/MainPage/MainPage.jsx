import { useLayoutEffect } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import useLastRiskAnalysis from '../../hooks/useLastRiskAnalysis.js';
import styles from './MainPage.module.css';

const SERVICES = [
  {
    key: 'risk',
    eyebrow: '계약 전 먼저',
    title: '전세 위험도 진단',
    description: <>주소와 계약 정보를 바탕으로<br />놓치기 쉬운 위험 신호를 확인해요.</>,
    cta: '위험도 진단하기',
    image: '/images/main/risk-diagnosis.png',
    imageAlt: '집과 계약 서류를 돋보기로 살펴보는 전세 위험도 진단 일러스트',
    theme: 'blue',
  },
  {
    key: 'checklist',
    eyebrow: '내 상황에 맞게',
    title: '보증 체크리스트',
    description: <>필요 서류 확인부터 발급·준비 방법까지<br />단계별로 빠짐없이 안내해드려요.</>,
    cta: '체크리스트 시작하기',
    image: '/images/main/guarantee-checklist.png',
    imageAlt: '보증 준비 서류와 완료된 체크리스트 일러스트',
    theme: 'green',
    to: '/guarantee-checklist',
  },
];

const REVEAL_EASE = [0.16, 1, 0.3, 1];

const introVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.1,
    },
  },
};

const introItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: REVEAL_EASE },
  },
};

const cardGridVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.28,
      staggerChildren: 0.13,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 34, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.82, ease: REVEAL_EASE },
  },
};

export default function MainPage() {
  const { user, isAuthenticated } = useAuth();
  const { entryPath: riskEntryPath } = useLastRiskAnalysis(user?.email);
  const prefersReducedMotion = useReducedMotion();
  const greeting = isAuthenticated
    ? `안녕하세요, ${user?.name ?? '사용자'}님`
    : '안녕하세요, HUGME입니다';
  const motionState = prefersReducedMotion ? 'visible' : undefined;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className={styles.root}>
      <motion.header
        className={styles.intro}
        variants={introVariants}
        initial={motionState ?? 'hidden'}
        animate="visible"
      >
        <motion.p className={styles.eyebrow} variants={introItemVariants}>
          HUGME HOME
        </motion.p>
        <motion.p className={styles.greeting} variants={introItemVariants}>
          {greeting}
        </motion.p>
        <motion.h1 variants={introItemVariants}>
          보증보험 가입 전 전세 위험은 먼저 확인하고,
          <br />내게 맞는 보증 준비는 빠짐없이 챙겨보세요.
        </motion.h1>
      </motion.header>

      <motion.section
        className={styles.cardGrid}
        aria-label="HUGME 주요 서비스"
        variants={cardGridVariants}
        initial={motionState ?? 'hidden'}
        animate="visible"
      >
        {SERVICES.map((service) => (
          <motion.div
            key={service.key}
            className={styles.cardMotion}
            variants={cardVariants}
          >
            <Link
              to={service.key === 'risk' ? riskEntryPath : service.to}
              className={`${styles.serviceCard} ${styles[service.theme]}`}
            >
              <div className={styles.cardCopy}>
                <span className={styles.cardEyebrow}>{service.eyebrow}</span>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>

              <img
                src={service.image}
                alt={service.imageAlt}
                className={styles.illustration}
              />

              <span className={styles.cardAction}>
                <span>{service.cta}</span>
                <FaArrowRightLong aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
