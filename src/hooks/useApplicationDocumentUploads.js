import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteDocumentUpload,
  getApplicationDocumentUploads,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  getDocumentUpload,
  uploadApplicationDocument,
} from '../api/file/documentFileService.js';

function errorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.response?.data?.detail ?? fallback;
}

export function useApplicationDocumentUploads(applicationId) {
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState(null);
  const [busyUploadId, setBusyUploadId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (applicationId == null) {
      setUploads([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      setUploads(await getApplicationDocumentUploads(applicationId));
    } catch (requestError) {
      setError(errorMessage(requestError, '업로드한 서류 목록을 불러오지 못했습니다.'));
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  const processingIds = useMemo(
    () => uploads.filter((upload) => upload.validationStatus === 'PROCESSING').map((upload) => upload.uploadId),
    [uploads],
  );
  const processingKey = processingIds.join(',');

  useEffect(() => {
    if (processingIds.length === 0) return undefined;

    const refreshProcessingUploads = async () => {
      const settled = await Promise.allSettled(processingIds.map(getDocumentUpload));
      const updates = new Map(
        settled
          .filter((result) => result.status === 'fulfilled')
          .map((result) => [result.value.uploadId, result.value]),
      );
      setUploads((current) => current.map((upload) => updates.get(upload.uploadId) ?? upload));
    };

    const timer = window.setInterval(refreshProcessingUploads, 2000);

    return () => window.clearInterval(timer);
  }, [processingKey]);

  const upload = useCallback(async (documentId, file) => {
    setBusyDocumentId(documentId);
    setError('');
    try {
      const created = await uploadApplicationDocument(applicationId, documentId, file);
      setUploads((current) => [created, ...current.filter((item) => item.uploadId !== created.uploadId)]);
      return created;
    } catch (requestError) {
      const message = errorMessage(requestError, '서류를 업로드하지 못했습니다.');
      setError(message);
      throw new Error(message);
    } finally {
      setBusyDocumentId(null);
    }
  }, [applicationId]);

  const preview = useCallback(async (uploadId) => {
    setBusyUploadId(uploadId);
    setError('');
    try {
      return await getDocumentPreviewUrl(uploadId);
    } catch (requestError) {
      setError(errorMessage(requestError, '미리보기 주소를 발급하지 못했습니다.'));
      return null;
    } finally {
      setBusyUploadId(null);
    }
  }, []);

  const download = useCallback(async (uploadId) => {
    setBusyUploadId(uploadId);
    setError('');
    try {
      const response = await getDocumentDownloadUrl(uploadId);
      window.location.assign(response.url);
    } catch (requestError) {
      setError(errorMessage(requestError, '다운로드 주소를 발급하지 못했습니다.'));
    } finally {
      setBusyUploadId(null);
    }
  }, []);

  const remove = useCallback(async (uploadId) => {
    setBusyUploadId(uploadId);
    setError('');
    try {
      await deleteDocumentUpload(uploadId);
      setUploads((current) => current.filter((upload) => upload.uploadId !== uploadId));
    } catch (requestError) {
      setError(errorMessage(requestError, '업로드한 서류를 삭제하지 못했습니다.'));
    } finally {
      setBusyUploadId(null);
    }
  }, []);

  return {
    uploads,
    isLoading,
    busyDocumentId,
    busyUploadId,
    error,
    upload,
    preview,
    download,
    remove,
    reload: load,
  };
}
