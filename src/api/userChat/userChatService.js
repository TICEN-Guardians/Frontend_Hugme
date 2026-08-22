import axiosInstance from '../axiosInstance.js';

const GUIDE_CHAT_BASE_URL = '/api/chatbot/guide';

export async function getEntryQuestions() {
  const response = await axiosInstance.get(`${GUIDE_CHAT_BASE_URL}/entry-questions`);
  return response.data;
}

export async function sendGuideMessage(sessionId, message) {
  const response = await axiosInstance.post(`${GUIDE_CHAT_BASE_URL}/messages`, {
    sessionId,
    message,
  });
  return response.data;
}

export async function getGuideChatHistory(sessionId) {
  const response = await axiosInstance.get(`${GUIDE_CHAT_BASE_URL}/history`, {
    params: { sessionId },
  });
  return response.data;
}

export async function getGuideSessions() {
  const response = await axiosInstance.get(`${GUIDE_CHAT_BASE_URL}/sessions`);
  return response.data;
}

export async function deleteGuideSession(sessionId) {
  await axiosInstance.delete(`${GUIDE_CHAT_BASE_URL}/sessions/${sessionId}`);
}
