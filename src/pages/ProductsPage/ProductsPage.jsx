import { motion, useReducedMotion } from 'framer-motion';
import {
  HiArrowPathRoundedSquare,
  HiShieldCheck,
} from 'react-icons/hi2';
import { PRODUCT_CODES, PRODUCT_DETAIL_PATH, PRODUCT_THEME } from '../../constants/products.js';
import ProductGroup from './ProductGroup/ProductGroup.jsx';
import styles from './ProductsPage.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

const GROUPS = [
  {
    id: 'no-loan',
    theme: PRODUCT_THEME.GENERAL,
    icon: <HiShieldCheck aria-hidden="true" />,
    badgeLabel: '일반 전세계약',
    title: '전세보증금반환보증',
    summary: '계약 종료 후 전세보증금을 돌려받지 못하는 경우를 보호하는 보증',
    facts: [
      {
        label: '보증금',
        value: '수도권 7억원 이하 · 그 외 지역 5억원 이하',
      },
      {
        label: '신청기한',
        value: '전세계약기간의 1/2이 지나기 전',
      },
    ],
    ctaLabel: '일반 반환보증 준비물 확인',
    to: PRODUCT_DETAIL_PATH[PRODUCT_CODES.GENERAL],
  },
  {
    id: 'special-return',
    theme: PRODUCT_THEME.SPECIAL,
    icon: <HiArrowPathRoundedSquare aria-hidden="true" />,
    badgeLabel: '역전세 특례대출 연계',
    title: '특례반환보증',
    summary: '특례대출을 이용한 임대인의 후속 임차인을 보호하는 반환보증',
    facts: [
      {
        label: '가입대상',
        value: '특례대출 연계 주택의 후속 임차인',
      },
      {
        label: '확인사항',
        value: '전세보증금 반환목적 특례대출 연계 여부 확인',
      },
    ],
    ctaLabel: '특례 반환보증 준비물 확인',
    to: PRODUCT_DETAIL_PATH[PRODUCT_CODES.SPECIAL],
  },
];

export default function ProductsPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.root}>
      <motion.header
        className={styles.hero}
        initial={{
          opacity: 0,
          y: prefersReducedMotion ? 0 : 34,
          scale: prefersReducedMotion ? 1 : 0.988,
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.35 : 1.05, delay: 0.08, ease: ENTRY_EASE }}
      >
        <span className={styles.heroBadge}>HUG 보증상품 안내</span>
        <h1 className={styles.pageTitle}>보증가입 체크리스트</h1>
        <p className={styles.pageSubtitle}>
          가입할 보증을 선택하고 필요한 준비서류를 확인하세요.
        </p>
      </motion.header>
      <div className={styles.groups}>
        {GROUPS.map((group, index) => (
          <ProductGroup
            key={group.id}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
            {...group}
          />
        ))}
      </div>
    </div>
  );
}
