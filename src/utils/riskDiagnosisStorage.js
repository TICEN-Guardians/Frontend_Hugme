const STORAGE_PREFIX = 'hugme:last-risk-analysis';
export const RISK_ANALYSIS_CHANGED_EVENT = 'hugme:risk-analysis-changed';

function getRiskStorageKey(email) {
  return email ? `${STORAGE_PREFIX}:${encodeURIComponent(email)}` : null;
}

function notifyRiskAnalysisChanged(email) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(RISK_ANALYSIS_CHANGED_EVENT, {
      detail: { email },
    }),
  );
}

export function getLastRiskAnalysisId(email) {
  const key = getRiskStorageKey(email);
  if (!key || typeof window === 'undefined') return null;

  return window.localStorage.getItem(key);
}

export function setLastRiskAnalysisId(email, analysisId) {
  const key = getRiskStorageKey(email);
  if (!key || analysisId == null || typeof window === 'undefined') return;

  window.localStorage.setItem(key, String(analysisId));
  notifyRiskAnalysisChanged(email);
}

export function clearLastRiskAnalysisId(email) {
  const key = getRiskStorageKey(email);
  if (!key || typeof window === 'undefined') return;

  window.localStorage.removeItem(key);
  notifyRiskAnalysisChanged(email);
}

export function getRiskEntryPath(email) {
  const analysisId = getLastRiskAnalysisId(email);

  return analysisId ? `/risk/${analysisId}` : '/risk/new';
}


const ANONYMOUS_STORAGE_PREFIX = 'hugme:anonymous-risk-analysis';

function anonymousStorageKey(analysisId) {
  return analysisId == null ? null : `${ANONYMOUS_STORAGE_PREFIX}:${analysisId}`;
}

export function setAnonymousRiskSession(session) {
  const key = anonymousStorageKey(session?.analysisId);
  if (!key || !session?.accessToken || typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, JSON.stringify({
    analysisId: String(session.analysisId),
    accessToken: session.accessToken,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
    mode: session.mode,
  }));
}

export function getAnonymousRiskSession(analysisId) {
  const key = anonymousStorageKey(analysisId);
  if (!key || typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    const expiresAt = Date.parse(session.accessTokenExpiresAt);
    if (!session.accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return session;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function clearAnonymousRiskSession(analysisId) {
  const key = anonymousStorageKey(analysisId);
  if (!key || typeof window === 'undefined') return;
  window.sessionStorage.removeItem(key);
}
