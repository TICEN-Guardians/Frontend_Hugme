import axiosInstance from '../../api/axiosInstance.js';
import { clearAccessToken, setAccessToken } from '../../api/tokenStore.js';
import {
  mockLoginResponse,
  mockReissueResponse,
  mockSignupResponse,
  mockUser,
  mockVerifyMailResponse,
} from '../../mocks/auth.mock.js';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 이메일로 회원가입을 요청한다.
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @param {string} name - 사용자 이름
 * @returns {Promise<object>} 생성된 사용자 정보
 */
export async function signup(email, password, name) {
  if (isMock()) {
    return Promise.resolve(mockSignupResponse);
  }
  const res = await axiosInstance.post('/api/auth/signup', { email, password, name });
  return res.data;
}

/**
 * 이메일/비밀번호로 로그인하고, 성공하면 accessToken을 tokenStore에 저장한다.
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @returns {Promise<object>} 로그인 응답 데이터 ({ accessToken, tokenType })
 */
export async function login(email, password) {
  if (isMock()) {
    setAccessToken(mockLoginResponse.accessToken, mockLoginResponse.tokenType);
    return Promise.resolve(mockLoginResponse);
  }
  const res = await axiosInstance.post('/api/auth/login', { email, password });
  setAccessToken(res.data.accessToken, res.data.tokenType);
  return res.data;
}

/**
 * 로그아웃을 요청하고 tokenStore를 비운다.
 * @returns {Promise<object>} 로그아웃 응답 데이터
 */
export async function logout() {
  if (isMock()) {
    clearAccessToken();
    return Promise.resolve({});
  }
  const res = await axiosInstance.post('/api/auth/logout');
  clearAccessToken();
  return res.data;
}

/**
 * accessToken 재발급을 요청하고, 성공하면 tokenStore를 갱신한다.
 * @returns {Promise<object>} 재발급 응답 데이터 ({ accessToken, tokenType })
 */
export async function reissue() {
  if (isMock()) {
    setAccessToken(mockReissueResponse.accessToken, mockReissueResponse.tokenType);
    return Promise.resolve(mockReissueResponse);
  }
  const res = await axiosInstance.post('/api/auth/token/reissue');
  setAccessToken(res.data.accessToken, res.data.tokenType);
  return res.data;
}

/**
 * 이메일 인증 토큰을 검증한다.
 * @param {string} token - 이메일 인증 토큰
 * @returns {Promise<object>} 인증 결과
 */
export async function verifyMail(token) {
  if (isMock()) {
    return Promise.resolve(mockVerifyMailResponse);
  }
  const res = await axiosInstance.get('/api/auth/mail/verify', { params: { token } });
  return res.data;
}

/**
 * 현재 로그인된 사용자 정보를 조회한다.
 * @returns {Promise<object>} 사용자 정보
 */
export async function getMe() {
  if (isMock()) {
    return Promise.resolve(mockUser);
  }
  const res = await axiosInstance.get('/api/users/me');
  return res.data;
}

/**
 * 회원 탈퇴를 요청하고 tokenStore를 비운다.
 * @returns {Promise<object>} 탈퇴 처리 결과
 */
export async function withdraw() {
  if (isMock()) {
    clearAccessToken();
    return Promise.resolve({});
  }
  const res = await axiosInstance.delete('/api/users/me');
  clearAccessToken();
  return res.data;
}
