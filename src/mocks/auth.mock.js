// 스키마 미확정 — 백엔드 확인 필요

export const mockUser = {
  id: 1,
  email: 'user@example.com',
  name: '홍길동',
};

export const mockSignupResponse = {
  id: 1,
  email: 'user@example.com',
};

export const mockLoginResponse = {
  accessToken: 'mock-access-token',
  tokenType: 'Bearer',
};

export const mockReissueResponse = {
  accessToken: 'mock-access-token-reissued',
  tokenType: 'Bearer',
};

export const mockVerifyMailResponse = {
  verified: true,
};
