import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import SuccessModal from '../../components/common/Modal/SuccessModal.jsx';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import AuthLayout from '../../layout/AuthLayout/AuthLayout.jsx';
import styles from './LoginPage.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENTRY_EASE = [0.16, 1, 0.3, 1];

const formVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.16,
      staggerChildren: 0.09,
    },
  },
};

const fieldVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 24,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: ENTRY_EASE,
    },
  },
};

const ctaVariants = {
  hidden: (reducedMotion) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 20,
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: ENTRY_EASE,
    },
  },
};

function validate(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }
  if (!password) {
    errors.password = '비밀번호를 입력해주세요.';
  }
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = location.state?.from;
      const returnTo = typeof from === 'string'
        ? from
        : from?.pathname
          ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
          : '/main';
      const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/main';
      navigate(safeReturnTo, { replace: true });
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: error?.response?.data?.message ?? '이메일 또는 비밀번호를 다시 확인해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorConfirm = () => {
    setErrorModal({ isOpen: false, message: '' });
  };

  return (
    <AuthLayout title="로그인">
      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="login-email">
              이메일
            </label>
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>
          <input
            id="login-email"
            type="email"
            className={styles.input}
            placeholder="이메일을 입력해 주세요"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </motion.div>

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="login-password">
              비밀번호
            </label>
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>
          <div className={styles.passwordWrap}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </button>
          </div>
        </motion.div>

        <motion.div className={styles.row} custom={prefersReducedMotion} variants={fieldVariants}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            로그인 유지
          </label>
        </motion.div>

        <motion.div
          custom={prefersReducedMotion}
          variants={ctaVariants}
          whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.005 }}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.99 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </motion.div>

        <motion.p className={styles.crossLink} custom={prefersReducedMotion} variants={ctaVariants}>
          아직 회원이 아니신가요? <Link to="/auth/signup">회원가입</Link>
        </motion.p>
      </motion.form>

      <SuccessModal
        isOpen={errorModal.isOpen}
        tone="error"
        title="로그인 실패"
        description={errorModal.message}
        actionLabel="다시 입력하기"
        onAction={handleErrorConfirm}
        onClose={handleErrorConfirm}
      />
    </AuthLayout>
  );
}
