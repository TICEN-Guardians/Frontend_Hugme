import { motion } from 'framer-motion';
import ProductCard from '../ProductCard/ProductCard.jsx';
import styles from './ProductGroup.module.css';

const ENTRY_EASE = [0.22, 1, 0.36, 1];

export default function ProductGroup({ theme, icon, badgeLabel, title, description, products, index }) {
  return (
    <motion.section
      className={styles.group}
      data-theme={theme}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{
        duration: 0.6,
        delay: index === 0 ? 0.08 : 0.15,
        ease: ENTRY_EASE,
      }}
    >
      <div className={styles.header}>
        <span className={styles.iconBadge}>{icon}</span>
        <span className={styles.badge}>{badgeLabel}</span>
      </div>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      <div className={styles.cards}>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </motion.section>
  );
}
