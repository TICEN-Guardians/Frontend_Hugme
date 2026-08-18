import { useCallback, useState } from 'react';
import {
  createApplication,
  getInfo,
  getResultDocuments,
  updateInfo,
  uploadLeaseContract,
} from '../services/checklist/checklistService.js';

/**
 * 계약서 업로드 → 분석 중 → OCR 결과 확인 → 질문 → 완료 흐름을 관리한다.
 * step: 'idle' | 'analyzing' | 'ocrConfirm' | 'questions' | 'done'
 */
export function useContractUpload(productCode) {
  const [step, setStep] = useState('idle');
  const [applicationId, setApplicationId] = useState(null);
  const [ocrInfo, setOcrInfo] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [finalDocuments, setFinalDocuments] = useState(null);

  const startUpload = useCallback(
    async (file) => {
      setUploadError(null);
      setStep('analyzing');

      try {
        // 이전 시도에서 만들어진 applicationId가 있으면 재사용하고 새로 만들지 않는다.
        let currentApplicationId = applicationId;
        if (!currentApplicationId) {
          const application = await createApplication(productCode);
          currentApplicationId = application.applicationId;
          setApplicationId(currentApplicationId);
        }

        await uploadLeaseContract(currentApplicationId, file);
        const info = await getInfo(currentApplicationId);
        setOcrInfo(info);
        setStep('ocrConfirm');
      } catch (err) {
        setUploadError(err);
        setStep('idle');
      }
    },
    [applicationId, productCode],
  );

  const confirmOcrInfo = useCallback(
    async (formValues) => {
      if (!applicationId) return;
      setIsConfirming(true);
      try {
        const updated = await updateInfo(applicationId, formValues);
        setOcrInfo(updated);
        setStep('questions');
      } catch (err) {
        setUploadError(err);
      } finally {
        setIsConfirming(false);
      }
    },
    [applicationId],
  );

  const closeOcrConfirm = useCallback(() => {
    setStep('idle');
  }, []);

  /** 질문 흐름이 끝난 뒤 최종 서류 목록을 받아와 'done'으로 전환한다. */
  const finishQuestions = useCallback(async () => {
    if (!applicationId) return;
  
    try {
      const result = await getResultDocuments(applicationId);
  
      setFinalDocuments(result);
      setStep('done');
    } catch (err) {
      setUploadError(err);
    }
  }, [applicationId]);

  return {
    step,
    applicationId,
    ocrInfo,
    uploadError,
    isConfirming,
    finalDocuments,
    startUpload,
    confirmOcrInfo,
    closeOcrConfirm,
    finishQuestions,
  };
}
