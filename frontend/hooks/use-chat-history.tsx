"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Conversation,
  ConversationSurface,
  StoredMessage,
  buildConversation,
  deleteConversation,
  loadConversations,
  persistConversations,
  renameConversation,
  updateConversationMessages,
} from "@/lib/chat-history";

interface ChatHistoryContextValue {
  conversations: Conversation[];
  // False until conversations have been loaded from localStorage for the
  // current user. Callers that need to resume a specific conversation by id
  // should wait for this before trusting a getConversation() miss.
  isHydrated: boolean;
  getConversation: (id: string) => Conversation | undefined;
  create: (params: {
    surface: ConversationSurface;
    contextId?: string;
    title: string;
    messages: StoredMessage[];
  }) => Conversation;
  updateMessages: (id: string, messages: StoredMessage[]) => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(
  null,
);

export function ChatHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const isHydratedRef = useRef(false);
  const userSubRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isUserLoading) return;
    isHydratedRef.current = false;
    setIsHydrated(false);
    const sub = user?.sub;
    userSubRef.current = sub;
    setConversations(sub ? loadConversations(sub) : []);
    isHydratedRef.current = true;
    setIsHydrated(true);
  }, [isUserLoading, user?.sub]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    const sub = userSubRef.current;
    if (!sub) return;
    persistConversations(sub, conversations);
  }, [conversations]);

  const getConversation = useCallback(
    (id: string) => conversations.find((conv) => conv.id === id),
    [conversations],
  );

  const create = useCallback<ChatHistoryContextValue["create"]>((params) => {
    const conversation = buildConversation(params);
    setConversations((prev) => [conversation, ...prev]);
    return conversation;
  }, []);

  const updateMessages = useCallback(
    (id: string, messages: StoredMessage[]) => {
      setConversations((prev) =>
        updateConversationMessages(prev, id, messages),
      );
    },
    [],
  );

  const rename = useCallback((id: string, title: string) => {
    setConversations((prev) => renameConversation(prev, id, title));
  }, []);

  const remove = useCallback((id: string) => {
    setConversations((prev) => deleteConversation(prev, id));
  }, []);

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations],
  );

  const value = useMemo<ChatHistoryContextValue>(
    () => ({
      conversations: sortedConversations,
      isHydrated,
      getConversation,
      create,
      updateMessages,
      rename,
      remove,
    }),
    [
      sortedConversations,
      isHydrated,
      getConversation,
      create,
      updateMessages,
      rename,
      remove,
    ],
  );

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory(): ChatHistoryContextValue {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return ctx;
}
