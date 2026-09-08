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
import { getAccessToken, useUser } from "@auth0/nextjs-auth0/client";
import {
  Conversation,
  ConversationSurface,
  StoredMessage,
  appendMessage,
  buildConversation,
  deleteConversation,
  formatBiomodelIds,
  generateId,
  loadConversations,
  persistConversations,
  renameConversation,
} from "@/lib/chat-history";
import { messageFromErrorBody } from "@/lib/api-error";

interface SendMessageParams {
  conversationId: string | null;
  surface: ConversationSurface;
  contextId?: string;
  // Only used when conversationId is null, to seed a brand-new conversation
  // (e.g. the welcome text) alongside the new user turn.
  seedMessages: StoredMessage[];
  userContent: string;
  // Only used when conversationId is null, as the new conversation's title.
  // Falls back to the user's message when omitted (e.g. plain /chat).
  title?: string;
  fetcher: (
    token: string | undefined,
    signal: AbortSignal,
  ) => Promise<Response>;
}

interface ChatHistoryContextValue {
  conversations: Conversation[];
  // False until conversations have been loaded from localStorage for the
  // current user. Callers that need to resume a specific conversation by id
  // should wait for this before trusting a getConversation() miss.
  isHydrated: boolean;
  getConversation: (id: string) => Conversation | undefined;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
  isPending: (id: string | null) => boolean;
  stopGenerating: (id: string) => void;
  // Appends the user's message (creating the conversation first if
  // conversationId is null) and kicks off the request in the background,
  // returning the conversation id immediately. The request's lifecycle
  // (append the reply, clear pending state) is owned entirely by this
  // provider — which lives for the whole app session — not by whatever
  // component called sendMessage, so switching chats or navigating away
  // doesn't cancel or lose the reply.
  sendMessage: (params: SendMessageParams) => string;
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
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

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

  const rename = useCallback((id: string, title: string) => {
    setConversations((prev) => renameConversation(prev, id, title));
  }, []);

  const remove = useCallback((id: string) => {
    setConversations((prev) => deleteConversation(prev, id));
  }, []);

  const isPending = useCallback(
    (id: string | null) => (id ? pendingIds.has(id) : false),
    [pendingIds],
  );

  const stopGenerating = useCallback((id: string) => {
    abortControllersRef.current.get(id)?.abort();
  }, []);

  const setPending = (id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const sendMessage = useCallback((params: SendMessageParams): string => {
    const userMessage: StoredMessage = {
      id: generateId(),
      role: "user",
      content: params.userContent,
      timestamp: new Date().toISOString(),
    };

    let id = params.conversationId;
    if (id) {
      const existingId = id;
      setConversations((prev) => appendMessage(prev, existingId, userMessage));
    } else {
      const conversation = buildConversation({
        surface: params.surface,
        contextId: params.contextId,
        title:
          params.title?.trim() ||
          params.userContent.trim() ||
          "New conversation",
        messages: [...params.seedMessages, userMessage],
      });
      id = conversation.id;
      setConversations((prev) => [conversation, ...prev]);
    }

    const conversationId = id;
    setPending(conversationId, true);
    const controller = new AbortController();
    abortControllersRef.current.set(conversationId, controller);

    // Deliberately not awaited: this closure only touches this provider's
    // own state setters, so it keeps running (and will still append the
    // reply) even after the component that called sendMessage unmounts.
    (async () => {
      try {
        const token = await getAccessToken();
        const res = await params.fetcher(token, controller.signal);
        const data = await res.json().catch(() => null);

        // A rejected request still parses as JSON, so without this check the
        // reason (rate limit, budget exhausted, bad request) was silently
        // dropped and every failure looked like an empty reply.
        if (!res.ok) {
          const errorMessage: StoredMessage = {
            id: generateId(),
            role: "assistant",
            content: messageFromErrorBody(
              data,
              `The server returned an error (${res.status}). Please try again.`,
            ),
            timestamp: new Date().toISOString(),
          };
          setConversations((prev) =>
            appendMessage(prev, conversationId, errorMessage),
          );
          return;
        }

        const aiResponse =
          data?.response || "Sorry, I didn't get a response from the server.";
        const assistantMessage: StoredMessage = {
          id: generateId(),
          role: "assistant",
          content: formatBiomodelIds(aiResponse, data.bmkeys || []),
          timestamp: new Date().toISOString(),
          modelUsed: data.model_used,
        };
        setConversations((prev) =>
          appendMessage(prev, conversationId, assistantMessage),
        );
      } catch (error) {
        const isAbort =
          error instanceof DOMException && error.name === "AbortError";
        const errorMessage: StoredMessage = {
          id: generateId(),
          role: "assistant",
          content: isAbort
            ? "_Response cancelled._"
            : "There was an error connecting to the backend. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setConversations((prev) =>
          appendMessage(prev, conversationId, errorMessage),
        );
      } finally {
        abortControllersRef.current.delete(conversationId);
        setPending(conversationId, false);
      }
    })();

    return conversationId;
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
      rename,
      remove,
      isPending,
      stopGenerating,
      sendMessage,
    }),
    [
      sortedConversations,
      isHydrated,
      getConversation,
      rename,
      remove,
      isPending,
      stopGenerating,
      sendMessage,
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
