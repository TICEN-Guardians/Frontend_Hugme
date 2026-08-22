import { useCallback, useEffect, useState } from 'react';
import {
  getDocumentPreparation,
  updateDocumentPreparation,
} from '../api/docChat/docChatService.js';

export function useDocumentPreparation(applicationId) {
  const [preparation, setPreparation] = useState(null);
  const [checklistCompleted, setChecklistCompleted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadPreparation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!applicationId) {
        setChecklistCompleted(false);
        setPreparation(null);
        return;
      }

      const result = await getDocumentPreparation(applicationId);
      setChecklistCompleted(true);
      setPreparation(result);
    } catch (requestError) {
      setChecklistCompleted(false);
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
      setIsUpdating(true);
      setError(null);

      try {
        if (!applicationId) return;

        const result = await updateDocumentPreparation(
          applicationId,
          documentId,
          prepared,
        );
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
    checklistCompleted,
    isLoading,
    isUpdating,
    error,
    reload: loadPreparation,
    changePrepared,
  };
}
