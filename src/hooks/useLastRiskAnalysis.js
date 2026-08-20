import { useEffect, useMemo, useState } from 'react';
import {
  getLastRiskAnalysisId,
  getRiskEntryPath,
  RISK_ANALYSIS_CHANGED_EVENT,
} from '../utils/riskDiagnosisStorage.js';

export default function useLastRiskAnalysis(email) {
  const [lastAnalysisId, setLastAnalysisIdState] = useState(() => getLastRiskAnalysisId(email));

  useEffect(() => {
    const sync = () => {
      setLastAnalysisIdState(getLastRiskAnalysisId(email));
    };

    sync();

    window.addEventListener('storage', sync);
    window.addEventListener(RISK_ANALYSIS_CHANGED_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(RISK_ANALYSIS_CHANGED_EVENT, sync);
    };
  }, [email]);

  const entryPath = useMemo(() => getRiskEntryPath(email), [email, lastAnalysisId]);

  return {
    lastAnalysisId,
    entryPath,
    hasLastAnalysis: Boolean(lastAnalysisId),
  };
}
