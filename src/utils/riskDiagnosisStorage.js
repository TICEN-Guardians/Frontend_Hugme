const STORAGE_PREFIX = 'hugme:last-risk-analysis';
export const RISK_ANALYSIS_CHANGED_EVENT = 'hugme:risk-analysis-changed';

export function getRiskStorageKey(email) {
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
