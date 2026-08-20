export type ConversationSurface = "chat" | "search" | "analyze";

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  surface: ConversationSurface;
  contextId?: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = "vcell-ai-chat-history";

const getStorageKey = (userSub: string): string =>
  `${STORAGE_KEY_PREFIX}:${userSub}`;

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const loadConversations = (userSub: string): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(userSub));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const persistConversations = (
  userSub: string,
  conversations: Conversation[],
): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getStorageKey(userSub),
      JSON.stringify(conversations),
    );
  } catch {
    // Ignore storage write failures (e.g. quota exceeded, private browsing).
  }
};

export const buildConversation = (params: {
  surface: ConversationSurface;
  contextId?: string;
  title: string;
  messages: StoredMessage[];
}): Conversation => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    surface: params.surface,
    contextId: params.contextId,
    title: params.title,
    messages: params.messages,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateConversationMessages = (
  conversations: Conversation[],
  id: string,
  messages: StoredMessage[],
): Conversation[] =>
  conversations.map((conv) =>
    conv.id === id
      ? { ...conv, messages, updatedAt: new Date().toISOString() }
      : conv,
  );

export const renameConversation = (
  conversations: Conversation[],
  id: string,
  title: string,
): Conversation[] =>
  conversations.map((conv) =>
    conv.id === id
      ? { ...conv, title, updatedAt: new Date().toISOString() }
      : conv,
  );

export const deleteConversation = (
  conversations: Conversation[],
  id: string,
): Conversation[] => conversations.filter((conv) => conv.id !== id);
