import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const FOOTER_LOGO_SRC = '/images/Footer_Logo.png';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.brandCol}>
          <img src={FOOTER_LOGO_SRC} alt="Hugme" className={styles.logo} />
          <p className={styles.tagline}>
            AI 전세보증금 위험 진단 · 안심 전세 상담 서비스
          </p>
          <p className={styles.copyright}>
            © HUGME. All rights reserved.
          </p>
        </div>

        <nav className={styles.linkCol}>
          <Link to="/">서비스 소개</Link>
          <Link to="/">이용약관</Link>
          <Link to="/">개인정보처리방침</Link>
        </nav>

        <nav className={styles.linkCol}>
          <Link to="/">고객센터</Link>
          <Link to="/">이용가이드</Link>
          <Link to="/">제휴 문의</Link>
        </nav>
      </div>
    </footer>
  );
}
