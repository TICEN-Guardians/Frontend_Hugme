import { useCallback, useEffect, useState } from 'react';
import {
  createApplication,
  getInfo,
  getResultDocuments,
  updateInfo,
  uploadLeaseContract,
} from '../services/checklist/checklistService.js';

export const LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY = 'hugme:lastDocumentChatApplicationId';

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
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let ignore = false;
    const savedApplicationId = sessionStorage.getItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);

    if (!savedApplicationId) {
      setIsRestoring(false);
      return undefined;
    }

    setApplicationId(savedApplicationId);
    setIsRestoring(true);

    Promise.allSettled([
      getInfo(savedApplicationId),
      getResultDocuments(savedApplicationId),
    ])
      .then(([infoResult, documentsResult]) => {
        if (ignore) return;

        if (infoResult.status === 'fulfilled') {
          setOcrInfo(infoResult.value);
        }

        if (documentsResult.status === 'fulfilled') {
          setFinalDocuments(documentsResult.value);
          setStep('done');
        } else if (infoResult.status === 'fulfilled') {
          setStep('idle');
        } else {
          sessionStorage.removeItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
          setApplicationId(null);
          setStep('idle');
        }
      })
      .finally(() => {
        if (!ignore) setIsRestoring(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const startUpload = useCallback(
    async (file, { forceNew = false } = {}) => {
      setUploadError(null);
      setStep('analyzing');

      try {
        // 이전 시도에서 만들어진 applicationId가 있으면 재사용하고 새로 만들지 않는다.
        let currentApplicationId = forceNew ? null : applicationId;
        if (forceNew) {
          setApplicationId(null);
          setOcrInfo(null);
          setFinalDocuments(null);
          sessionStorage.removeItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY);
        }

        if (!currentApplicationId) {
          const application = await createApplication(productCode);
          currentApplicationId = application.applicationId;
          setApplicationId(currentApplicationId);
          sessionStorage.setItem(LAST_DOCUMENT_CHAT_APPLICATION_ID_KEY, String(currentApplicationId));

          if (application.applicationStatus === 'DONE' || application.status === 'DONE') {
            const docs = await getResultDocuments(currentApplicationId);
            setFinalDocuments(docs);
            setStep('done');
            return;
          }
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

  const restartUpload = useCallback(
    (file) => startUpload(file, { forceNew: true }),
    [startUpload],
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

  const reopenOcrConfirm = useCallback(() => {
    setStep('ocrConfirm');
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
    isRestoring,
    finalDocuments,
    startUpload,
    restartUpload,
    confirmOcrInfo,
    closeOcrConfirm,
    reopenOcrConfirm,
    finishQuestions,
  };
}
