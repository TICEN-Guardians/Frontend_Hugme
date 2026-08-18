let accessToken = null;
let tokenType = null;

export function getAccessToken() {
  return accessToken;
}

export function getTokenType() {
  return tokenType;
}

export function setAccessToken(token, type) {
  accessToken = token;
  tokenType = type;
}

export function getAuthorizationHeader() {
  if (!accessToken) return null;
  return `${tokenType || 'Bearer'} ${accessToken}`;
}

export function clearAccessToken() {
  accessToken = null;
  tokenType = null;
}
