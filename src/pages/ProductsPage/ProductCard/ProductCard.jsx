import { Link } from 'react-router-dom';
import buttonStyles from '../../../components/common/Button/Button.module.css';
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
        <span className={`${styles.cta} ${styles.ctaDisabled}`}>{ctaLabel}</span>
      ) : (
        <Link
          to={to}
          className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.cta}`}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
