import { useCallback, useEffect, useState } from 'react';
import {
  getDocumentPreparation,
  updateDocumentPreparation,
} from '../api/docChat/docChatService.js';
import { getChecklistCompletion } from '../api/checklist/checklistService.js';

export function useDocumentPreparation() {
  const [preparation, setPreparation] = useState(null);
  const [checklistCompleted, setChecklistCompleted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadPreparation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const completed = await getChecklistCompletion();
      setChecklistCompleted(completed);

      if (!completed) {
        setPreparation(null);
        return;
      }

      const result = await getDocumentPreparation();
      setPreparation(result);
    } catch (requestError) {
      setChecklistCompleted(false);
      setError(requestError);
      setPreparation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    checklistCompleted,
    isLoading,
    isUpdating,
    error,
    reload: loadPreparation,
    changePrepared,
  };
}
