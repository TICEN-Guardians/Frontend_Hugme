import axiosInstance from '../../api/axiosInstance.js';

const DOCUMENT_CHAT_BASE_URL = '/api/chatbot/documents';

export async function getDocumentPreparation() {
  const response = await axiosInstance.get(`${DOCUMENT_CHAT_BASE_URL}/preparation`);
  return response.data;
}

export async function updateDocumentPreparation(documentId, prepared) {
  const response = await axiosInstance.put(
    `${DOCUMENT_CHAT_BASE_URL}/preparation/${documentId}`,
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
