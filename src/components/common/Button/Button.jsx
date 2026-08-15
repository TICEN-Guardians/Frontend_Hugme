import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
