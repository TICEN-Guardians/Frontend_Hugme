import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import SuccessModal from '../../components/common/Modal/SuccessModal.jsx';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import AuthLayout from '../../layout/AuthLayout/AuthLayout.jsx';
import styles from './SignupPage.module.css';

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

const TERMS_CONTENT = {
  terms: [
    'HUGME 이용약관 상세 내용은 현재 준비 중입니다.',
    '실제 서비스 적용 전 확정된 약관 문구로 교체해주세요.',
  ],
  privacy: [
    'HUGME 개인정보 처리방침 상세 내용은 현재 준비 중입니다.',
    '실제 서비스 적용 전 확정된 개인정보 처리방침 문구로 교체해주세요.',
  ],
};

function validate({ name, email, password, passwordConfirm, agreeTerms }) {
  const errors = {};
  if (!name.trim()) {
    errors.name = '이름을 입력해주세요.';
  }
  if (!email.trim()) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }
  if (!password) {
    errors.password = '비밀번호를 입력해주세요.';
  } else if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다.';
  }
  if (!passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 다시 입력해주세요.';
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  }
  if (!agreeTerms) {
    errors.agreeTerms = '이용약관 및 개인정보 처리방침에 동의해주세요.';
  }
  return errors;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ name, email, password, passwordConfirm, agreeTerms });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      await signup(email, password, name);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setFormError(error?.response?.data?.message ?? '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    navigate('/auth/login', { replace: true });
  };

  return (
    <AuthLayout title="회원가입">
      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="signup-name">
              이름
            </label>
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
          </div>
          <input
            id="signup-name"
            type="text"
            className={styles.input}
            placeholder="이름을 입력해 주세요"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </motion.div>

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="signup-email">
              이메일
            </label>
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>
          <div className={styles.emailInputWrap}>
            <input
              id="signup-email"
              type="email"
              className={`${styles.input} ${styles.emailInput}`}
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {/* TODO: 이메일 인증 요청 API가 아직 없음. 버튼만 표시, 클릭 동작 없음 */}
            <Button type="button" variant="secondary" size="sm" className={styles.verifyButton}>
              인증
            </Button>
          </div>
        </motion.div>

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="signup-password">
              비밀번호
            </label>
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>
          <div className={styles.passwordWrap}>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="signup-password-confirm">
              비밀번호 확인
            </label>
            {errors.passwordConfirm && <p className={styles.fieldError}>{errors.passwordConfirm}</p>}
          </div>
          <div className={styles.passwordWrap}>
            <input
              id="signup-password-confirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="비밀번호를 다시 입력해 주세요"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPasswordConfirm ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </button>
          </div>
        </motion.div>

        <motion.div className={styles.field} custom={prefersReducedMotion} variants={fieldVariants}>
          <div className={styles.termsBox}>
            <div className={styles.termsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />
                이용약관 및 개인정보 처리방침에 동의합니다
              </label>
              <button
                type="button"
                className={styles.termsDetailButton}
                onClick={() => setIsTermsModalOpen(true)}
              >
                자세히 보기
              </button>
            </div>
            <p className={`${styles.fieldError} ${styles.termsError}`}>
              {errors.agreeTerms ?? ''}
            </p>
          </div>
        </motion.div>

        <motion.div
          custom={prefersReducedMotion}
          variants={ctaVariants}
          whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.005 }}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.99 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </motion.div>

        <motion.p className={styles.crossLink} custom={prefersReducedMotion} variants={ctaVariants}>
          이미 회원이신가요? <Link to="/auth/login">로그인</Link>
        </motion.p>
      </motion.form>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="회원가입 완료"
        description={`${email} 주소로 인증 메일을 보냈어요. 메일함에서 인증을 완료한 뒤 로그인해주세요.`}
        actionLabel="로그인하러 가기"
        onAction={handleSuccessConfirm}
        onClose={handleSuccessConfirm}
      />
      <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)}>
        <div className={styles.termsModal}>
          <h2 className={styles.termsModalTitle}>이용약관 및 개인정보 처리방침</h2>
          <div className={styles.termsModalBody}>
            <section className={styles.termsSection}>
              <h3>이용약관</h3>
              {TERMS_CONTENT.terms.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section className={styles.termsSection}>
              <h3>개인정보 처리방침</h3>
              {TERMS_CONTENT.privacy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
}
