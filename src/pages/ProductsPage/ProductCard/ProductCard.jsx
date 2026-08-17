import { HiArrowRight } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ title, description, ctaLabel, to, disabled }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>

      <p className={styles.description}>
        {description.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>

      {disabled ? (
        <button type="button" className={`${styles.cta} ${styles.ctaDisabled}`} disabled>
          <span>{ctaLabel}</span>
          <HiArrowRight aria-hidden="true" />
        </button>
      ) : (
        <Link to={to} className={styles.cta}>
          <span>{ctaLabel}</span>
          <HiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
