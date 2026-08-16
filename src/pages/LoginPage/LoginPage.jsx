import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import styles from './LoginPage.module.css';

const LOGO_SRC = '/images/Logo.png';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error?.response?.data?.message ?? '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.side}>
        <div className={styles.logoBox}>
          <img src={LOGO_SRC} alt="Hugme" className={styles.logo} />
        </div>
      </div>

      <div className={styles.formSide}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>가입한 계정으로 로그인하세요</p>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              이메일
            </label>
            <input
              id="login-email"
              type="email"
              className={styles.input}
              placeholder="이메일 주소"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              className={styles.input}
              placeholder="비밀번호"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
          </div>

          <div className={styles.row}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              자동 로그인
            </label>
            {/* TODO: 비밀번호 찾기 플로우/라우트 미정 */}
            <span className={styles.linkLike}>비밀번호 찾기</span>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', background: 'var(--brand-blue)', color: 'var(--on-accent)' }}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>

          <p className={styles.crossLink}>
            계정이 없으신가요? <Link to="/auth/signup">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
