import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import styles from './ProductGroup.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];

export default function ProductGroup({
  theme,
  icon,
  badgeLabel,
  title,
  summary,
  facts,
  ctaLabel,
  to,
  index,
  prefersReducedMotion,
}) {
  return (
    <motion.section
      className={styles.group}
      data-theme={theme}
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 28,
        scale: prefersReducedMotion ? 1 : 0.988,
      }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -4,
        boxShadow: '0 1.8rem 4.8rem rgba(15, 23, 42, 0.11)',
      }}
      transition={{
        duration: prefersReducedMotion ? 0.35 : 0.95,
        delay: prefersReducedMotion ? 0 : index === 0 ? 0.18 : 0.29,
        ease: ENTRY_EASE,
      }}
    >
      <div className={styles.header}>
        <span className={styles.iconBadge}>{icon}</span>
        <span className={styles.badge}>{badgeLabel}</span>
      </div>

      <div className={styles.intro}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.summary}>{summary}</p>
      </div>

      <dl className={styles.factList}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.factItem}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.ctaArea}>
        <Link to={to} className={styles.cta}>
          <span>{ctaLabel}</span>
          <HiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </motion.section>
  );
}
