import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  reissue,
  signup as signupRequest,
} from '../../services/auth/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
        // 세션 없음 = 정상적인 비로그인 상태. 에러로 취급하지 않는다.
        if (ignore) return;
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!ignore) setIsAuthLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    await loginRequest(email, password);
    const me = await getMe();
    setUser(me);
    setIsAuthenticated(true);
    return me;
  }, []);

  const signup = useCallback((email, password, name) => signupRequest(email, password, name), []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, isAuthLoading, login, signup, logout }),
    [user, isAuthenticated, isAuthLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
