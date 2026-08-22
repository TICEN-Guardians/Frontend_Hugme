import axiosInstance, { refreshAccessToken } from '../axiosInstance.js';
import { clearAccessToken, setAccessToken } from '../tokenStore.js';

export async function signup(email, password, name) {
  const response = await axiosInstance.post('/api/auth/signup', {
    email,
    password,
    name,
  });

  return response.data;
}

export async function checkEmail(email) {
  const response = await axiosInstance.post('/api/auth/mail/check', {
    mail: email,
  });

  return response.data;
}

export async function login(email, password, rememberMe = false) {
  const response = await axiosInstance.post(
    '/api/auth/login',
    {
      email,
      password,
      rememberMe,
    },
    {
      skipAuthRefresh: true,
    },
  );

  setAccessToken(
    response.data.accessToken,
    response.data.tokenType,
  );

  return response.data;
}

export function reissue() {
  return refreshAccessToken();
}

export async function verifyMail(token) {
  const response = await axiosInstance.get('/api/auth/mail/verify', {
    params: { token },
  });

  return response.data;
}

export async function getMe() {
  const response = await axiosInstance.get('/api/users/me');
  return response.data;
}

export async function logout() {
  try {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  } finally {
    clearAccessToken();
  }
}
