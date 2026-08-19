import axios from 'axios';
import { clearAccessToken, getAuthorizationHeader, setAccessToken } from './tokenStore.js';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const REISSUE_URL = '/api/auth/token/reissue';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

const reissueClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function notifyAuthExpired() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('auth:expired'));
}

axiosInstance.interceptors.request.use((config) => {
  const authHeader = getAuthorizationHeader();

  if (authHeader) {
    config.headers.Authorization = authHeader;
  }

  return config;
});

let refreshPromise = null;

export function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = reissueClient
    .post(REISSUE_URL)
    .then(({ data }) => {
      if (!data?.accessToken) {
        throw new Error('재발급 응답에 accessToken이 없습니다.');
      }

      setAccessToken(data.accessToken, data.tokenType);
      return data;
    })
    .catch((error) => {
      clearAccessToken();
      notifyAuthExpired();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!config || !response) {
      return Promise.reject(error);
    }

    const shouldRefresh =
      response.status === 401 &&
      !config._retry &&
      !config.skipAuthRefresh &&
      config.url !== REISSUE_URL;

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      await refreshAccessToken();
      return axiosInstance(config);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
