const DOCUMENT_CHAT_HISTORY_PREFIX = 'hugme:document-chat-history:';
const MAX_DOCUMENT_CHAT_SESSIONS = 20;

export const DOCUMENT_CHAT_HISTORY_UPDATED_EVENT = 'document-chat-history-updated';

const getStorageKey = (email) =>
  `${DOCUMENT_CHAT_HISTORY_PREFIX}${encodeURIComponent(email || 'authenticated-user')}`;

export const createDocumentChatConversationId = () =>
  window.crypto?.randomUUID?.()
  ?? `document-chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function getDocumentChatSessions(email) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(getStorageKey(email)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDocumentChatSession(email, session) {
  const sessions = getDocumentChatSessions(email);
  const nextSessions = [
    session,
    ...sessions.filter((item) => item.conversationId !== session.conversationId),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_DOCUMENT_CHAT_SESSIONS);

  window.localStorage.setItem(getStorageKey(email), JSON.stringify(nextSessions));
  window.dispatchEvent(new CustomEvent(DOCUMENT_CHAT_HISTORY_UPDATED_EVENT, {
    detail: { email },
  }));
}
