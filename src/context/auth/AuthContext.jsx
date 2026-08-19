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

export const AuthContext = createContext(null);
const AUTH_CHANNEL_NAME = 'hugme-auth';
export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const authChannelRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
 
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
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthLoading(false);
  
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
    let ignore = false;

    reissue()
      .then(() => getMe())
      .then((me) => {
        if (ignore) return;

        setUser(me);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (ignore) return;

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
      setUser(null);
      setIsAuthenticated(false);

      if (location.pathname.startsWith('/risk')) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [location.pathname, navigate]);

  const signup = useCallback((email, password, name) => signupRequest(email, password, name), []);

  const checkEmail = useCallback((email) => checkEmailRequest(email), []);
  
  const login = useCallback(async (email, password) => {
    await loginRequest(email, password);
    const me = await getMe();

    setUser(me);
    setIsAuthenticated(true);

    return me;
  }, []);

 const logout = useCallback(async () => {
  try {
    await logoutRequest();
  } finally {
    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);

    authChannelRef.current?.postMessage({
      type: 'LOGOUT',
      timestamp: Date.now(),
    });
  }
}, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
