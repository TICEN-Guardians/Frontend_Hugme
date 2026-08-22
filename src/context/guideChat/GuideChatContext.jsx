import { createContext, useContext } from 'react';
import useGuideChat from '../../hooks/useGuideChat.js';

const GuideChatContext = createContext(null);

export function GuideChatProvider({ children }) {
  const chat = useGuideChat();
  return <GuideChatContext.Provider value={chat}>{children}</GuideChatContext.Provider>;
}

export function useGuideChatContext() {
  const context = useContext(GuideChatContext);
  if (!context) {
    throw new Error('useGuideChatContext must be used within GuideChatProvider');
  }
  return context;
}
