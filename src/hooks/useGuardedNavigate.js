import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth/AuthContext.jsx';

export default function useGuardedNavigate() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);

  const guardedNavigate = (path) => {
    if (!path) return;

    if (isAuthenticated) {
      navigate(path);
      return;
    }

    setPendingPath(path);
  };

  const confirmLogin = () => {
    if (!pendingPath) return;

    navigate('/auth/login', { state: { from: { pathname: pendingPath } } });
    setPendingPath(null);
  };

  const cancelLogin = () => {
    setPendingPath(null);
  };

  return {
    guardedNavigate,
    isLoginConfirmPending: pendingPath !== null,
    confirmLogin,
    cancelLogin,
  };
}
