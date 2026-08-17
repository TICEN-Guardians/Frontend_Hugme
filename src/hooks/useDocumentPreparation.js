import { useCallback, useEffect, useState } from 'react';
import {
  getDocumentPreparation,
  updateDocumentPreparation,
} from '../services/docChat/docChatService.js';

export function useDocumentPreparation(applicationId) {
  const [preparation, setPreparation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadPreparation = useCallback(async () => {
    if (!applicationId) {
      setPreparation(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getDocumentPreparation(applicationId);
      setPreparation(result);
    } catch (requestError) {
      setError(requestError);
      setPreparation(null);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadPreparation();
  }, [loadPreparation]);

  const changePrepared = useCallback(
    async (documentId, prepared) => {
      if (!applicationId) return;

      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateDocumentPreparation(applicationId, documentId, prepared);
        setPreparation(result);
      } catch (requestError) {
        setError(requestError);
      } finally {
        setIsUpdating(false);
      }
    },
    [applicationId],
  );

  return {
    preparation,
    isLoading,
    isUpdating,
    error,
    reload: loadPreparation,
    changePrepared,
  };
}
