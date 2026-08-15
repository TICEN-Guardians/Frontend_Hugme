let accessToken = null;
let tokenType = null;

export function getAccessToken() {
  return accessToken;
}

export function getTokenType() {
  return tokenType;
}

/**
 * Authorization 헤더 값을 만든다. tokenType이 없으면 'Bearer'로 대체한다.
 * @returns {string|null} 저장된 토큰이 없으면 null
 */
export function getAuthorizationHeader() {
  if (!accessToken) return null;
  return `${tokenType || 'Bearer'} ${accessToken}`;
}

/**
 * @param {string} token - accessToken
 * @param {string} [type] - tokenType (예: 'Bearer')
 */
export function setAccessToken(token, type) {
  accessToken = token;
  tokenType = type;
}

export function clearAccessToken() {
  accessToken = null;
  tokenType = null;
}
