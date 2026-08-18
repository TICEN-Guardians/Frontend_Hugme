import axiosInstance from '../../api/axiosInstance.js';
import { getAuthorizationHeader } from '../../api/tokenStore.js';

const GUIDE_CHAT_BASE_URL = '/api/chatbot/guide';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getEntryQuestions() {
  const response = await axiosInstance.get(`${GUIDE_CHAT_BASE_URL}/entry-questions`);
  return response.data;
}

function parseSseEvent(rawEvent) {
  let event = 'message';
  const dataLines = [];

  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  }

  return { event, data: dataLines.join('\n') };
}
export async function sendGuideMessage(sessionId, message, onToken) {
  const response = await fetch(`${API_BASE_URL}${GUIDE_CHAT_BASE_URL}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(getAuthorizationHeader() ? { Authorization: getAuthorizationHeader() } : {}),
    },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`상담 챗봇 응답을 받아오지 못했습니다. (status: ${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResponse = null;

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const { event, data } = parseSseEvent(rawEvent);
      if (event === 'token' && data) {
        onToken?.(data);
      } else if (event === 'done') {
        finalResponse = JSON.parse(data);
      }

      boundary = buffer.indexOf('\n\n');
    }
  }

  if (!finalResponse) {
    throw new Error('상담 챗봇 응답이 완료되지 않았습니다.');
  }

  return finalResponse;
}

export async function getGuideChatHistory() {
  const response = await axiosInstance.get(`${GUIDE_CHAT_BASE_URL}/history`);
  return response.data;
}
