import axios from 'axios';
import { clearAccessToken, getAuthorizationHeader, setAccessToken } from './tokenStore.js';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// reissue 전용 인스턴스. axiosInstance의 인터셉터를 타지 않아야
// reissue 자체가 401을 받아도 다시 reissue를 부르는 무한 루프가 생기지 않는다.
const reissueClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    // 401이 아니거나, 요청 정보가 없거나, 이미 한 번 재시도한 요청이면 그대로 reject.
    if (!config || !response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    // 이미 재발급이 진행 중이면 대기열에 넣고, 재발급이 끝나면 처리한다.
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
        // TODO: 세션 만료 처리. AuthProvider 연결 단계에서 /auth/login으로
        // SPA 라우팅 리다이렉트를 붙인다 (window.location 사용 금지).

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
