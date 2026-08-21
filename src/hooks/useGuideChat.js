import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/auth/AuthContext.jsx';
import useGuardedNavigate from './useGuardedNavigate.js';
import useLastRiskAnalysis from './useLastRiskAnalysis.js';
import {
  deleteGuideSession,
  getEntryQuestions,
  getGuideChatHistory,
  getGuideSessions,
  sendGuideMessage,
} from '../api/userChat/userChatService.js';

const FEATURE_PATHS = {
  DOCUMENT_GUIDE: '/doc-chat',
};

const historyToMessages = (history) =>
  history.flatMap((entry) => [
    { role: 'user', content: entry.question },
    { role: 'assistant', content: entry.answer },
  ]);

const resolveRedirectPath = (redirect) => {
  if (!redirect) return null;
  return FEATURE_PATHS[redirect.feature] ?? redirect.path ?? null;
};

// 비로그인 사용자는 서버에 이력이 남지 않으므로, 브라우저 메모리 안에서만 여러 대화를 나눠 관리한다.
// (페이지를 벗어나면 사라짐 — 로그인 사용자의 서버 세션과는 별개의 가벼운 다중 대화 목록)
const createConversation = () => ({
  id: `conversation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sessionId: null,
  messages: [],
  suggestedQuestions: [],
  redirect: null,
});

export const getConversationTitle = (conversation) => {
  const firstUserMessage = conversation.messages.find((message) => message.role === 'user');
  return firstUserMessage?.content ?? '새 상담';
};

// 조건상담 챗봇의 상태·로직 전체(로그인/비로그인 이중 세션 관리, 메시지 전송, 사이드바 세션 목록,
// 로그인 가드)를 담은 훅. /user-chat 전체 화면 페이지와 플로팅 위젯(1/2단계)이 이 훅 하나를 같이
// 소비해서, 두 곳에 같은 비동기 로직을 복붙하지 않게 한다.
export default function useGuideChat() {
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const { entryPath: riskEntryPath } = useLastRiskAnalysis(user?.email);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [redirect, setRedirect] = useState(null);
  const [entryQuestions, setEntryQuestions] = useState([]);
  const [isEntryLoading, setIsEntryLoading] = useState(true);
  const [entryError, setEntryError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [anonConversations, setAnonConversations] = useState(() => [createConversation()]);
  const [activeAnonConversationId, setActiveAnonConversationId] = useState(
    () => anonConversations[0].id,
  );
  const [isSending, setIsSending] = useState(false);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const { guardedNavigate, isLoginConfirmPending, confirmLogin, cancelLogin } = useGuardedNavigate();

  const activeAnonConversation =
    anonConversations.find((conversation) => conversation.id === activeAnonConversationId) ??
    anonConversations[0];

  const currentMessages = isAuthenticated ? messages : activeAnonConversation.messages;
  const currentSuggestedQuestions = isAuthenticated
    ? suggestedQuestions
    : activeAnonConversation.suggestedQuestions;
  const currentRedirect = isAuthenticated ? redirect : activeAnonConversation.redirect;
  const activeThreadKey = isAuthenticated ? sessionId ?? 'new' : activeAnonConversationId;

  const entrySuggestionQuestions = useMemo(
    () =>
      entryQuestions
        .flatMap((group) => group.questions ?? [])
        .filter((question) => typeof question === 'string' && question.trim().length > 0),
    [entryQuestions],
  );

  useEffect(() => {
    let ignore = false;

    async function loadEntryQuestions() {
      setIsEntryLoading(true);
      setEntryError(null);

      try {
        const result = await getEntryQuestions();

        if (ignore) return;
        setEntryQuestions(Array.isArray(result) ? result : []);
      } catch (error) {
        if (ignore) return;
        setEntryError(error);
      } finally {
        if (!ignore) {
          setIsEntryLoading(false);
        }
      }
    }

    loadEntryQuestions();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setSessions([]);
      return undefined;
    }

    let ignore = false;

    getGuideSessions()
      .then((result) => {
        if (ignore) return;
        setSessions(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (ignore) return;
        setSessions([]);
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAuthLoading]);

  const updateAnonConversation = (conversationId, updater) => {
    setAnonConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation,
      ),
    );
  };

  const startNewChat = () => {
    if (isSending) return;

    if (isAuthenticated) {
      if (sessionId === null) return;
      setSessionId(null);
      setMessages([]);
      setSuggestedQuestions([]);
      setRedirect(null);
      return;
    }

    const conversation = createConversation();
    setAnonConversations((prev) => [conversation, ...prev]);
    setActiveAnonConversationId(conversation.id);
  };

  const selectAnonConversation = (conversationId) => {
    if (isSending || conversationId === activeAnonConversationId) return;
    setActiveAnonConversationId(conversationId);
  };

  const openSession = async (session) => {
    if (session.sessionId === sessionId || isSending) return;

    setSuggestedQuestions([]);
    setRedirect(null);
    setSessionId(session.sessionId);

    try {
      const history = await getGuideChatHistory(session.sessionId);
      setMessages(Array.isArray(history) ? historyToMessages(history) : []);
    } catch {
      setMessages([]);
    }
  };

  const removeSession = async (event, targetSessionId) => {
    event.stopPropagation();

    try {
      await deleteGuideSession(targetSessionId);
    } catch {
      return;
    }

    setSessions((prev) => prev.filter((session) => session.sessionId !== targetSessionId));

    if (targetSessionId === sessionId) {
      startNewChat();
    }
  };

  const sendQuestionAuthenticated = async (trimmedQuestion) => {
    setMessages((prev) => [...prev, { role: 'user', content: trimmedQuestion }]);
    setSuggestedQuestions([]);
    setRedirect(null);

    try {
      const response = await sendGuideMessage(sessionId, trimmedQuestion);

      setSessionId(response.sessionId ?? sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer ?? '답변을 불러왔지만 표시할 내용이 없습니다.',
        },
      ]);
      setSuggestedQuestions(
        Array.isArray(response.suggestedQuestions) ? response.suggestedQuestions : [],
      );
      setRedirect(response.redirect ?? null);

      getGuideSessions()
        .then((result) => setSessions(Array.isArray(result) ? result : []))
        .catch(() => {});
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '상담 답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    }
  };

  const sendQuestionAnonymous = async (trimmedQuestion) => {
    const conversationId = activeAnonConversationId;
    const currentSessionId = activeAnonConversation.sessionId;

    updateAnonConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: [...conversation.messages, { role: 'user', content: trimmedQuestion }],
      suggestedQuestions: [],
      redirect: null,
    }));

    try {
      const response = await sendGuideMessage(currentSessionId, trimmedQuestion);

      updateAnonConversation(conversationId, (conversation) => ({
        ...conversation,
        sessionId: response.sessionId ?? conversation.sessionId,
        messages: [
          ...conversation.messages,
          {
            role: 'assistant',
            content: response.answer ?? '답변을 불러왔지만 표시할 내용이 없습니다.',
          },
        ],
        suggestedQuestions: Array.isArray(response.suggestedQuestions)
          ? response.suggestedQuestions
          : [],
        redirect: response.redirect ?? null,
      }));
    } catch (error) {
      updateAnonConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages,
          {
            role: 'assistant',
            content: '상담 답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          },
        ],
      }));
    }
  };

  const sendQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) return;

    setIsSending(true);
    setIsWaitingForAnswer(true);

    if (isAuthenticated) {
      await sendQuestionAuthenticated(trimmedQuestion);
    } else {
      await sendQuestionAnonymous(trimmedQuestion);
    }

    setIsSending(false);
    setIsWaitingForAnswer(false);
  };

  const handleRedirect = () => {
    const path = currentRedirect?.feature === 'RISK_DIAGNOSIS'
      ? riskEntryPath
      : resolveRedirectPath(currentRedirect);
    if (!path) return;
    guardedNavigate(path);
  };

  return {
    isAuthenticated,
    sessionId,
    sessions,
    anonConversations,
    activeAnonConversationId,
    currentMessages,
    currentSuggestedQuestions,
    currentRedirect,
    activeThreadKey,
    entryQuestions,
    entrySuggestionQuestions,
    isEntryLoading,
    entryError,
    isSending,
    isWaitingForAnswer,
    isLoginConfirmPending,
    confirmLogin,
    cancelLogin,
    sendQuestion,
    startNewChat,
    selectAnonConversation,
    openSession,
    removeSession,
    handleRedirect,
  };
}
