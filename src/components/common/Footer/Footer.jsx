import { FaLocationDot } from 'react-icons/fa6';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.location}>
          <span className={styles.locationIcon} aria-hidden="true">
            <FaLocationDot />
          </span>
          <address className={styles.address}>
            서울 송파구 중대로 135 IT벤처타워 서관 12,17층
            <span className={styles.postalCode}>05717</span>
          </address>
        </div>

        <div className={styles.info}>
          <p className={styles.tagline}>AI 전세보증금 위험 진단 · 안심 전세 상담 서비스</p>
          <span className={styles.divider} aria-hidden="true" />
          <p className={styles.copyright}>© HUGME. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
