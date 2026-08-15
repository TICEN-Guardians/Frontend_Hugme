import ProductCard from '../ProductCard/ProductCard.jsx';
import styles from './ProductGroup.module.css';

export default function ProductGroup({ theme, icon, badgeLabel, title, description, products }) {
  return (
    <section className={styles.group} data-theme={theme}>
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
    </section>
  );
}
