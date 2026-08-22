import { createContext, useCallback, useContext, useEffect, useMemo,  useRef,useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearAccessToken,
} from '../../api/tokenStore.js';
import {
  checkEmail as checkEmailRequest,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  reissue,
  signup as signupRequest,
} from '../../api/auth/authService.js';
import SuccessModal from '../../components/common/Modal/SuccessModal.jsx';

export const AuthContext = createContext(null);

const AUTH_CHANNEL_NAME = 'hugme-auth';
const LAST_ACTIVITY_KEY = 'hugme:lastActivityAt';
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 5 * 1000;
export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const authChannelRef = useRef(null);
  const authenticatedRef = useRef(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isIdleLogoutNoticeOpen, setIsIdleLogoutNoticeOpen] = useState(false);
  const [isSessionExpiredNoticeOpen, setIsSessionExpiredNoticeOpen] = useState(false);
  const AUTH_ENTRY_PATHS = [
    '/auth/login',
    '/auth/signup',
    '/auth/mail/verify',
    '/api/auth/mail/verify',
  ];
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.BroadcastChannel === 'undefined'
    ) {
      return undefined;
    }

    const channel = new BroadcastChannel(
      AUTH_CHANNEL_NAME,
    );

    authChannelRef.current = channel;

    const handleAuthMessage = (event) => {
      if (event.data?.type !== 'LOGOUT') {
        return;
      }

      clearAccessToken();
      authenticatedRef.current = false;
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthLoading(false);

      if (event.data?.reason === 'IDLE') {
        setIsIdleLogoutNoticeOpen(true);
      } else {
        setIsSessionExpiredNoticeOpen(true);
      }

      navigate('/', { replace: true });
    };

    channel.addEventListener(
      'message',
      handleAuthMessage,
    );

    return () => {
      channel.removeEventListener(
        'message',
        handleAuthMessage,
      );

      channel.close();

      if (authChannelRef.current === channel) {
        authChannelRef.current = null;
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (AUTH_ENTRY_PATHS.includes(location.pathname)) {
      authenticatedRef.current = false;
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthLoading(false);

      return undefined;
    }

    let ignore = false;

    reissue()
      .then(() => getMe())
      .then((me) => {
        if (ignore) return;

        authenticatedRef.current = true;
        setUser(me);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (ignore) return;

        authenticatedRef.current = false;
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!ignore) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      const wasAuthenticated = authenticatedRef.current;

      clearAccessToken();
      authenticatedRef.current = false;
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthLoading(false);

      if (wasAuthenticated) {
        setIsSessionExpiredNoticeOpen(true);
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const signup = useCallback((email, password, name) => signupRequest(email, password, name), []);

  const checkEmail = useCallback((email) => checkEmailRequest(email), []);

  const login = useCallback(async (email, password, rememberMe) => {
    await loginRequest(email, password, rememberMe);
    const me = await getMe();

    authenticatedRef.current = true;
    setUser(me);
    setIsAuthenticated(true);

    return me;
  }, []);

 const logout = useCallback(async (reason = 'MANUAL') => {
  try {
    await logoutRequest();
  } finally {
    clearAccessToken();
    authenticatedRef.current = false;
    setUser(null);
    setIsAuthenticated(false);

    authChannelRef.current?.postMessage({
      type: 'LOGOUT',
      reason,
      timestamp: Date.now(),
    });
  }
}, []);

useEffect(() => {
  // 로그인하지 않은 상태에서는 타이머를 실행하지 않는다.
  if (!isAuthenticated) {
    return undefined;
  }

  let isIdleLogoutStarted = false;
  let lastActivityWriteAt = 0;

  // 사용자의 마지막 활동 시간을 기록한다.
  const recordActivity = () => {
    const now = Date.now();

    // 스크롤 등의 이벤트가 너무 자주 발생해도
    // localStorage는 1초에 한 번만 갱신한다.
    if (now - lastActivityWriteAt < 1000) {
      return;
    }

    lastActivityWriteAt = now;

    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      String(now),
    );
  };

  // 5분 이상 활동이 없었는지 확인한다.
  const checkIdleTime = async () => {
    const savedLastActivity =
      localStorage.getItem(LAST_ACTIVITY_KEY);

    const lastActivityAt =
      Number(savedLastActivity);

    // 저장된 활동 시간이 없으면 현재 시간부터 계산한다.
    if (!lastActivityAt) {
      recordActivity();
      return;
    }

    const idleTime =
      Date.now() - lastActivityAt;

    // 아직 5분이 지나지 않은 경우
    if (idleTime < IDLE_TIMEOUT_MS) {
      return;
    }

    // 로그아웃 요청이 이미 시작된 경우
    if (isIdleLogoutStarted) {
      return;
    }

    isIdleLogoutStarted = true;

    try {
      await logout('IDLE');
    } catch (error) {
      console.error(
        '자동 로그아웃 API 호출 실패:',
        error,
      );
    } finally {
      setIsIdleLogoutNoticeOpen(true);
      navigate('/', { replace: true });
    }
  };

  // 백그라운드에 있던 탭을 다시 열었을 때 즉시 확인한다.
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkIdleTime();
    }
  };

  const activityEvents = [
    'pointerdown',
    'keydown',
    'scroll',
    'touchstart',
  ];

  // 사용자 활동 이벤트 등록
  activityEvents.forEach((eventName) => {
    window.addEventListener(
      eventName,
      recordActivity,
      { passive: true },
    );
  });

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange,
  );

  // 로그인 직후부터 5분 계산 시작
  recordActivity();

  // 5초마다 미사용 시간 확인
  const intervalId = window.setInterval(
    checkIdleTime,
    IDLE_CHECK_INTERVAL_MS,
  );

  return () => {
    window.clearInterval(intervalId);

    activityEvents.forEach((eventName) => {
      window.removeEventListener(
        eventName,
        recordActivity,
      );
    });

    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );
  };
}, [
  isAuthenticated,
  logout,
  navigate,
]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthLoading,
      signup,
      checkEmail,
      login,
      logout,
    }),
    [user, isAuthenticated, isAuthLoading, signup, checkEmail, login, logout],
  );

  const handleSessionExpiredConfirm = () => {
    setIsSessionExpiredNoticeOpen(false);
    navigate('/auth/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SuccessModal
        isOpen={isIdleLogoutNoticeOpen}
        tone="error"
        title="자동 로그아웃 안내"
        description="장시간 사용하지 않아 자동 로그아웃되었습니다. 다시 로그인해주세요."
        actionLabel="확인"
        onAction={() => setIsIdleLogoutNoticeOpen(false)}
        onClose={() => setIsIdleLogoutNoticeOpen(false)}
      />
      <SuccessModal
        isOpen={isSessionExpiredNoticeOpen}
        tone="error"
        title="로그아웃되었습니다."
        description="다시 로그인해주세요."
        actionLabel="다시 로그인"
        onAction={handleSessionExpiredConfirm}
        onClose={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
