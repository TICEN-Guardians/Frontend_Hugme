import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';
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
    'HUGME는 전세보증 관련 정보 안내, 맞춤형 서류 체크리스트, AI 및 OCR 기반 서류 분석 서비스를 제공합니다.',

    '서비스에서 제공하는 정보와 AI 분석 결과는 참고용이며, 실제 보증 가입 가능 여부 및 심사 결과를 보장하지 않습니다.',

    '정확한 내용과 최종 심사 기준은 반드시 원본 서류 및 관련 기관을 통해 확인하시기 바랍니다.',

    '사용자는 정확한 정보를 입력해야 하며, 타인의 개인정보나 서류를 무단으로 등록해서는 안 됩니다.',
  ],

  privacy: [
    'HUGME는 회원 관리 및 맞춤형 서비스 제공을 위해 이메일, 이름, 계약 관련 정보 등을 수집할 수 있습니다.',

    '업로드된 계약서 등의 서류는 OCR 및 AI 기반 정보 분석을 위해 처리될 수 있습니다. 분석에 불필요한 주민등록번호, 전화번호 등의 개인정보는 분석에 사용하지 않으며 별도로 저장하지 않습니다.',

    '계약 주소는 암호화하여 안전하게 관리하며, 수집된 정보는 서비스 제공 목적에 필요한 범위에서만 이용합니다.',

    '사용자는 자신의 개인정보에 대한 열람, 수정, 삭제 및 동의 철회를 요청할 수 있습니다.',
  ],
};

function validate({ name, email, password, passwordConfirm, agreeTerms, checkedEmail }) {
  const errors = {};
  const normalizedEmail = email.trim();

  if (!name.trim()) {
    errors.name = '이름을 입력해주세요.';
  }
  if (!normalizedEmail) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  } else if (checkedEmail !== normalizedEmail) {
    errors.email = '이메일 중복확인을 완료해주세요.';
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
  const { signup, checkEmail } = useAuth();
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
  const [checkedEmail, setCheckedEmail] = useState('');
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setCheckedEmail('');
    setEmailCheckStatus('idle');
    setEmailCheckMessage('');
  };

  const handleEmailCheck = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrors((prev) => ({
        ...prev,
        email: '이메일을 입력해주세요.',
      }));
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: '올바른 이메일 형식이 아닙니다.',
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      email: '',
    }));
    setEmailCheckStatus('idle');
    setEmailCheckMessage('');
    setIsEmailChecking(true);

    try {
      const isDuplicated = await checkEmail(normalizedEmail);

      if (isDuplicated) {
        setCheckedEmail('');
        setEmailCheckStatus('error');
        setEmailCheckMessage('이미 사용 중인 이메일입니다.');
        return;
      }

      setCheckedEmail(normalizedEmail);
      setEmailCheckStatus('success');
      setEmailCheckMessage('사용 가능한 이메일입니다.');
    } catch (error) {
      setCheckedEmail('');
      setEmailCheckStatus('error');
      setEmailCheckMessage(
        error?.response?.data?.message ?? '이메일 중복확인에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsEmailChecking(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const nextErrors = validate({
      name,
      email,
      password,
      passwordConfirm,
      agreeTerms,
      checkedEmail,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      await signup(normalizedEmail, password, name);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setFormError(error?.response?.data?.message ?? '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
            {(errors.email || emailCheckMessage) && (
              <p
                className={styles.emailFeedback}
                data-status={errors.email ? 'error' : emailCheckStatus}
              >
                {errors.email || emailCheckMessage}
              </p>
            )}
          </div>
          <div className={styles.emailInputRow}>
            <input
              id="signup-email"
              type="email"
              className={styles.input}
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
            />
            <button
              type="button"
              className={styles.emailCheckButton}
              onClick={handleEmailCheck}
              disabled={isEmailChecking || isSubmitting}
            >
              {isEmailChecking ? '확인 중...' : '중복확인'}
            </button>
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
        title="인증 메일 발송 완료"
        description={`${checkedEmail || email.trim()} 주소로 인증 메일을 발송했습니다. 메일함에서 인증 버튼을 눌러 회원가입을 완료해주세요.`}
        actionLabel="확인"
        onAction={() => setIsSuccessModalOpen(false)}
        onClose={() => setIsSuccessModalOpen(false)}
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
