import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  checkEmail as checkEmailRequest,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  reissue,
  signup as signupRequest,
} from '../../api/auth/authService.js';

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
      setUser(null);
      setIsAuthenticated(false);
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
