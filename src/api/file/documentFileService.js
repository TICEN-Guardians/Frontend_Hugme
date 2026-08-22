import axiosInstance from '../axiosInstance.js';

export async function uploadApplicationDocument(applicationId, documentId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    `/api/file/applications/${applicationId}/documents/${documentId}/uploads`,
    formData,
  );
  return response.data;
}

export async function getDocumentUpload(uploadId) {
  const response = await axiosInstance.get(`/api/file/document-uploads/${uploadId}`);
  return response.data;
}

export async function getApplicationDocumentUploads(applicationId) {
  const response = await axiosInstance.get(
    `/api/file/applications/${applicationId}/document-uploads`,
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function getDocumentPreviewUrl(uploadId) {
  const response = await axiosInstance.get(
    `/api/file/document-uploads/${uploadId}/preview`,
  );
  return response.data;
}

export async function getDocumentDownloadUrl(uploadId) {
  const response = await axiosInstance.get(
    `/api/file/document-uploads/${uploadId}/download`,
  );
  return response.data;
}

export async function deleteDocumentUpload(uploadId) {
  await axiosInstance.delete(`/api/file/document-uploads/${uploadId}`);
}
