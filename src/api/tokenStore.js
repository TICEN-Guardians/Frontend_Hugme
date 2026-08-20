let accessToken = null;
let tokenType = null;

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
