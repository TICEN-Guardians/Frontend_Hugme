import { motion } from 'framer-motion';
import { LuMapPin, LuRotateCcw } from 'react-icons/lu';
import Button from '../../../common/Button/Button.jsx';
import styles from './ReportHeader.module.css';

export default function ReportHeader({ report, onRestart, motionSet }) {
  return (
    <motion.header
      className={styles.reportHeader}
      initial={motionSet.item.hidden}
      animate={motionSet.item.visible}
      transition={motionSet.item.visible.transition}
    >
      <div className={styles.headerText}>
        <div className={styles.titleRow}>
          <h1 className={styles.reportTitle}>{report.reportTitle}</h1>
          <span className={styles.scopeBadge}>{report.scopeLabel}</span>
          <span className={`${styles.gradeBadge} ${styles[report.badgeTone]}`}>{report.badgeLabel}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.address}>
            <LuMapPin aria-hidden="true" />
            {report.address || '주소 확인 필요'}
          </span>
          {report.housingType && <span>{report.housingType}</span>}
        </div>
        <p className={styles.time}>분석 {report.analyzedAt || '확인 필요'}</p>
      </div>

      <motion.div
        className={styles.restartMotion}
        whileHover={motionSet.buttonHover}
        whileTap={motionSet.buttonTap}
        transition={{ duration: 0.15 }}
      >
        <Button variant="secondary" className={styles.restartButton} onClick={onRestart}>
          <LuRotateCcw aria-hidden="true" />
          <span>다시 분석하기</span>
        </Button>
      </motion.div>
    </motion.header>
  );
}
