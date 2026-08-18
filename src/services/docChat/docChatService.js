import axiosInstance from '../../api/axiosInstance.js';

const DOCUMENT_CHAT_BASE_URL = '/api/chatbot/documents';

export async function getDocumentPreparation(applicationId) {
  const response = await axiosInstance.get(`${DOCUMENT_CHAT_BASE_URL}/${applicationId}/preparation`);
  return response.data;
}

export async function updateDocumentPreparation(applicationId, documentId, prepared) {
  const response = await axiosInstance.put(
    `${DOCUMENT_CHAT_BASE_URL}/${applicationId}/preparation/${documentId}`,
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
