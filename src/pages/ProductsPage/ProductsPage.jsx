import { PRODUCT_CODES, PRODUCT_THEME } from '../../constants/products.js';
import ProductGroup from './ProductGroup/ProductGroup.jsx';
import styles from './ProductsPage.module.css';

const GROUPS = [
  {
    id: 'no-loan',
    theme: PRODUCT_THEME.GENERAL,
    icon: '✓',
    badgeLabel: '대출 없이 계약한 경우',
    title: '전세보증금반환보증',
    description: '2종류 중 상황에 맞는 보증을 선택하세요',
    products: [
      {
        id: PRODUCT_CODES.GENERAL,
        title: '전세보증금반환보증',
        description: ['일반 전세계약 대상', '보증한도 최대 90%', '가입기간 전세계약과 동일'],
        ctaLabel: '준비물 확인 →',
        to: `/products/${PRODUCT_CODES.GENERAL}/checklist`,
        disabled: false,
      },
      {
        id: PRODUCT_CODES.SPECIAL,
        title: '특례반환보증',
        description: ['청년·신혼부부 대상', '보증료 할인 적용'],
        ctaLabel: '준비물 확인 →',
        to: `/products/${PRODUCT_CODES.SPECIAL}/checklist`,
        disabled: false,
      },
    ],
  },
  {
    id: 'with-loan',
    theme: PRODUCT_THEME.SPECIAL,
    icon: '●',
    badgeLabel: '전세자금대출 받은 경우',
    title: '전세금안심대출보증',
    description: '보증금 반환과 대출 상환을 한 번에 맡깁니다',
    products: [
      {
        // 전세금안심대출보증: PRODUCT_CODES에 코드값 없음 — 준비중, 카드만 비활성
        id: 'LOAN_SAFE_PENDING',
        title: '전세금안심대출보증',
        description: ['전세자금대출 이용자 대상', '보증금과 대출금을 함께 보호', '대출기관과 연계 심사'],
        ctaLabel: '준비중',
        to: null,
        disabled: true,
      },
    ],
  },
];

export default function ProductsPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.pageTitle}>보증가입 체크리스트</h1>
      <p className={styles.pageSubtitle}>
        가입 전 준비물과 확인 사항을 미리 체크하세요
        <br />
        대출 여부에 따라 준비물이 달라져요
      </p>
      <p className={styles.count}>
        가입 가능한 보증상품 <strong className={styles.countNumber}>2건</strong>
      </p>
      <div className={styles.groups}>
        {GROUPS.map((group) => (
          <ProductGroup key={group.id} {...group} />
        ))}
      </div>
    </div>
  );
}
