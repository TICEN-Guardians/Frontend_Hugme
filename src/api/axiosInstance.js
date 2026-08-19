import axios from 'axios';
import { clearAccessToken, getAuthorizationHeader, setAccessToken } from './tokenStore.js';

const baseURL = import.meta.env.VITE_API_BASE_URL;

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

let isRefreshing = false;
let pendingQueue = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    if (
      !config ||
      !response ||
      response.status !== 401 ||
      config._retry ||
      config.url === '/api/auth/token/reissue'
    ) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config, error });
      });
    }

    isRefreshing = true;

    return reissueClient
      .post('/api/auth/token/reissue')
      .then(({ data }) => {
        setAccessToken(data.accessToken, data.tokenType);
        const authHeader = getAuthorizationHeader();

        pendingQueue.forEach(({ resolve, config: queuedConfig }) => {
          queuedConfig.headers.Authorization = authHeader;
          resolve(axiosInstance(queuedConfig));
        });
        pendingQueue = [];

        config.headers.Authorization = authHeader;
        return axiosInstance(config);
      })
      .catch(() => {
        clearAccessToken();
        notifyAuthExpired();

        pendingQueue.forEach(({ reject, error: queuedError }) => reject(queuedError));
        pendingQueue = [];

        return Promise.reject(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  },
);

export default axiosInstance;
