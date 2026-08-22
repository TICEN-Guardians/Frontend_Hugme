import axiosInstance from '../axiosInstance.js';

const DOCUMENT_CHAT_BASE_URL = '/api/chatbot/documents';

export async function getDocumentPreparation(applicationId) {
  const response = await axiosInstance.get(
    `/api/applications/${applicationId}/documents/preparation`,
  );
  return response.data;
}

export async function updateDocumentPreparation(applicationId, documentId, prepared) {
  const response = await axiosInstance.put(
    `/api/applications/${applicationId}/documents/${documentId}/preparation`,
    { prepared },
  );

  return response.data;
}

export async function sendDocumentMessage(documentId, question) {
  const response = await axiosInstance.post(`${DOCUMENT_CHAT_BASE_URL}/messages`, {
    documentId,
    question,
  });

  return response.data;
}
