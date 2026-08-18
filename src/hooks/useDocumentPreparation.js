import { useCallback, useEffect, useState } from 'react';
import {
  getDocumentPreparation,
  updateDocumentPreparation,
} from '../services/docChat/docChatService.js';

export function useDocumentPreparation(enabled = true) {
  const [preparation, setPreparation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadPreparation = useCallback(async () => {
    if (!enabled) {
      setPreparation(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getDocumentPreparation();
      setPreparation(result);
    } catch (requestError) {
      setError(requestError);
      setPreparation(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadPreparation();
  }, [loadPreparation]);

  const changePrepared = useCallback(
    async (documentId, prepared) => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateDocumentPreparation(documentId, prepared);
        setPreparation(result);
      } catch (requestError) {
        setError(requestError);
      } finally {
        setIsUpdating(false);
      }
    },
    [],
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
