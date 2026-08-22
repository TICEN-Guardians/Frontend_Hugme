import { useCallback, useRef, useState } from 'react';
import {
  createPrepareApplication,
  getPrepareInfo,
  getPrepareResultDocuments,
  updatePrepareInfo,
} from '../api/checklist/prepareChecklistService.js';

/**
 * 계약서 업로드 없이 신청 조건을 직접 입력하는 모의테스트 흐름을 관리한다.
 * 실제 신청 ID나 결과는 sessionStorage에 저장하지 않는다.
 */
export function usePrepareChecklist(productCode) {
  const isStartingRef = useRef(false);
  const [step, setStep] = useState('idle');
  const [applicationId, setApplicationId] = useState(null);
  const [info, setInfo] = useState(null);
  const [finalDocuments, setFinalDocuments] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStep('idle');
    setApplicationId(null);
    setInfo(null);
    setFinalDocuments(null);
    setError(null);
    isStartingRef.current = false;
    setIsStarting(false);
    setIsConfirming(false);
  }, []);

  const start = useCallback(async () => {
    if (isStartingRef.current) return;

    isStartingRef.current = true;
    setIsStarting(true);
    setError(null);
    setFinalDocuments(null);

    try {
      const application = await createPrepareApplication(productCode);
      const currentApplicationId = application?.applicationId ?? application?.id;

      if (currentApplicationId == null) {
        throw new Error('모의테스트 신청 ID가 응답에 없습니다.');
      }

      const applicationInfo = await getPrepareInfo(currentApplicationId);
      setApplicationId(currentApplicationId);
      setInfo(applicationInfo);
      setStep('infoConfirm');
    } catch (err) {
      setError(err);
      setStep('idle');
    } finally {
      isStartingRef.current = false;
      setIsStarting(false);
    }
  }, [productCode]);

  const confirmInfo = useCallback(
    async (formValues) => {
      if (applicationId == null) return;

      setIsConfirming(true);
      setError(null);

      try {
        const updatedInfo = await updatePrepareInfo(applicationId, formValues);
        setInfo(updatedInfo);
        setStep('questions');
      } catch (err) {
        setError(err);
      } finally {
        setIsConfirming(false);
      }
    },
    [applicationId],
  );

  const reopenInfo = useCallback(() => {
    setStep('infoConfirm');
  }, []);

  const finishQuestions = useCallback(async () => {
    if (applicationId == null) return false;

    setError(null);

    try {
      const result = await getPrepareResultDocuments(applicationId);
      setFinalDocuments(result);
      setStep('done');
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  }, [applicationId]);

  return {
    step,
    applicationId,
    info,
    finalDocuments,
    isStarting,
    isConfirming,
    error,
    start,
    reset,
    confirmInfo,
    reopenInfo,
    finishQuestions,
  };
}
