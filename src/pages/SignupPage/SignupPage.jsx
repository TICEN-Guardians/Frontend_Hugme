import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import buttonStyles from '../../components/common/Button/Button.module.css';
import Button from '../../components/common/Button/Button.jsx';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import styles from './SignupPage.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function LogoPanel() {
  return (
    <div className={styles.side}>
      <div className={styles.logoBox}>
        <img src={logo} alt="Hugme" className={styles.logo} />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ name, email, password, passwordConfirm, agreeTerms });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      await signup(email, password, name);
      setIsComplete(true);
    } catch (error) {
      setFormError(error?.response?.data?.message ?? '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className={styles.shell}>
        <LogoPanel />
        <div className={styles.formSide}>
          <div className={styles.form}>
            <h1 className={styles.title}>인증 메일을 보냈어요</h1>
            <p className={styles.subtitle}>
              {email} 주소로 인증 메일을 보냈습니다.
              <br />
              메일함을 확인해 인증을 완료해주세요.
            </p>
            <Link
              to="/auth/login"
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${styles.fullWidthLink}`}
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <LogoPanel />

      <div className={styles.formSide}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>몇 가지만 입력하면 바로 시작할 수 있어요</p>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-name">
              이름
            </label>
            <input
              id="signup-name"
              type="text"
              className={styles.input}
              placeholder="이름"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              이메일
            </label>
            <div className={styles.inlineRow}>
              <input
                id="signup-email"
                type="email"
                className={styles.input}
                placeholder="이메일 주소"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              {/* TODO: 이메일 인증 요청 API가 아직 없음. 버튼만 표시, 클릭 동작 없음 */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                style={{ border: '1px solid var(--brand-blue)', color: 'var(--brand-blue)', flexShrink: 0 }}
              >
                인증
              </Button>
            </div>
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              className={styles.input}
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password-confirm">
              비밀번호 확인
            </label>
            <input
              id="signup-password-confirm"
              type="password"
              className={styles.input}
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <p className={styles.fieldError}>{errors.passwordConfirm}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
              />
              이용약관 및 개인정보 처리방침에 동의합니다
            </label>
            {errors.agreeTerms && <p className={styles.fieldError}>{errors.agreeTerms}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', background: 'var(--brand-blue)', color: 'var(--on-accent)' }}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>

          <p className={styles.crossLink}>
            이미 계정이 있으신가요? <Link to="/auth/login">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
