import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MessageSquare, Send, Square, Bot, User, Loader2 } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { useChatHistory } from "@/hooks/use-chat-history";
import type { ConversationSurface, StoredMessage } from "@/lib/chat-history";

type ModelId = "openai-model" | "local-model";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelUsed?: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  value: string;
  faqId?: string;
}

interface ChatParameters {
  biomodelId: string;
  bmName: string;
  category: string;
  owner: string;
  savedLow: string;
  savedHigh: string;
  maxRows: number;
  orderBy: string;
  llmMode: string;
}

interface ChatBoxProps {
  startMessage: string | string[];
  quickActions: QuickAction[];
  supplementalActions?: QuickAction[];
  cardTitle: string;
  promptPrefix?: string;
  isLoading?: boolean;
  parameters?: ChatParameters;
  surface: ConversationSurface;
  contextId?: string;
  conversationId?: string | null;
  onConversationSaved?: (id: string) => void;
}

// Pure helpers — no dependency on component state/props.
const createInitialMessages = (startMsg: string | string[]): Message[] => {
  if (Array.isArray(startMsg)) {
    return startMsg.map((content, index) => ({
      id: (index + 1).toString(),
      role: "assistant" as const,
      content,
      timestamp: new Date(),
    }));
  } else if (startMsg) {
    return [
      {
        id: "1",
        role: "assistant" as const,
        content: startMsg,
        timestamp: new Date(),
      },
    ];
  }
  return [];
};

const toMessage = (stored: StoredMessage): Message => ({
  id: stored.id,
  role: stored.role,
  content: stored.content,
  timestamp: new Date(stored.timestamp),
  modelUsed: stored.modelUsed,
});

const toStoredMessage = (message: Message): StoredMessage => ({
  id: message.id,
  role: message.role,
  content: message.content,
  timestamp: message.timestamp.toISOString(),
  modelUsed: message.modelUsed,
});

export const ChatBox: React.FC<ChatBoxProps> = ({
  startMessage,
  quickActions,
  supplementalActions,
  cardTitle,
  promptPrefix,
  isLoading: isInitialLoading = false,
  parameters,
  surface,
  contextId,
  conversationId,
  onConversationSaved,
}) => {
  const chatHistory = useChatHistory();

  // The conversation this ChatBox instance is bound to. Starts as whatever
  // the parent resolved from the URL; once a brand-new conversation is
  // created (first send), this updates immediately — synchronously ahead of
  // the parent's own re-render — so rendering switches over to the shared
  // store right away instead of waiting on props.
  const [boundConversationId, setBoundConversationId] = useState<
    string | null
  >(conversationId ?? null);

  // Only used before a conversation exists yet (nothing to read from the
  // shared store). The moment a conversation is created/bound, this is
  // ignored — the store becomes the single source of truth for messages.
  const [localSeedMessages, setLocalSeedMessages] = useState<Message[]>(() =>
    createInitialMessages(startMessage),
  );

  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("openai-model");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user, isLoading: isUserLoading } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storedConversation = boundConversationId
    ? chatHistory.getConversation(boundConversationId)
    : undefined;
  const messages: Message[] = storedConversation
    ? storedConversation.messages.map(toMessage)
    : localSeedMessages;
  // Reflects the shared store's pending state for this conversation, so the
  // spinner is correct even right after navigating back to a chat whose
  // reply kept generating in the background while this instance wasn't
  // mounted.
  const isLoading = boundConversationId
    ? chatHistory.isPending(boundConversationId)
    : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Seed messages (the welcome text / an in-progress auto-summary) only
  // apply before any conversation exists. Once bound to a conversation, the
  // store is authoritative and this is skipped entirely — no timing
  // coordination needed since boundConversationId flips synchronously the
  // moment a conversation is created.
  useEffect(() => {
    if (boundConversationId) return;
    if (!startMessage || isInitialLoading) return;
    setLocalSeedMessages((prev) => {
      if (prev.some((m) => m.role === "user")) return prev;
      return createInitialMessages(startMessage);
    });
  }, [startMessage, isInitialLoading, boundConversationId]);

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage("");
    if (action.faqId) {
      handleFaqAction(action.faqId, action.value);
    } else {
      handleSendMessage(action.value);
    }
  };

  // A stale boundConversationId (e.g. the conversation was deleted from
  // another tab) shouldn't silently swallow the next message — fall back to
  // starting a fresh conversation instead.
  const resolveExistingConversationId = (): string | null =>
    boundConversationId && chatHistory.getConversation(boundConversationId)
      ? boundConversationId
      : null;

  const bindIfNewConversation = (
    existingId: string | null,
    resultId: string,
  ) => {
    if (resultId !== existingId) {
      setBoundConversationId(resultId);
      onConversationSaved?.(resultId);
    }
  };

  const handleSendMessage = (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage;
    if (!msg.trim()) return;
    if (isUserLoading) return;
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    // Build parameter context string
    let parameterContext = "";
    if (parameters) {
      const contextParts = [];

      if (parameters.biomodelId) {
        contextParts.push(`biomodel ID: ${parameters.biomodelId}`);
      }
      if (parameters.bmName) {
        contextParts.push(`model name: ${parameters.bmName}`);
      }
      if (parameters.owner) {
        contextParts.push(`authored by: ${parameters.owner}`);
      }
      if (parameters.category && parameters.category !== "all") {
        contextParts.push(`category: ${parameters.category}`);
      }
      if (parameters.savedLow) {
        contextParts.push(`saved after: ${parameters.savedLow}`);
      }
      if (parameters.savedHigh) {
        contextParts.push(`saved before: ${parameters.savedHigh}`);
      }
      if (parameters.maxRows && parameters.maxRows !== 1000) {
        contextParts.push(`max results: ${parameters.maxRows}`);
      }
      if (parameters.orderBy && parameters.orderBy !== "date_desc") {
        contextParts.push(`sort by: ${parameters.orderBy}`);
      }

      if (contextParts.length > 0) {
        parameterContext = `\n\nHere are some specifics that I want: ${contextParts.join(", ")}`;
      }
    }

    const finalPrompt = promptPrefix
      ? `${promptPrefix} ${msg}${parameterContext}`
      : `${msg}${parameterContext}`;

    const priorForApi = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const existingId = resolveExistingConversationId();

    setInputMessage("");

    const resultId = chatHistory.sendMessage({
      conversationId: existingId,
      surface,
      contextId,
      seedMessages: existingId ? [] : localSeedMessages.map(toStoredMessage),
      userContent: msg,
      fetcher: (token, signal) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            conversation_history: [
              ...priorForApi,
              { role: "user", content: finalPrompt },
            ],
            model: selectedModel,
          }),
          signal,
        }),
    });

    bindIfNewConversation(existingId, resultId);
  };

  const handleFaqAction = (faqId: string, displayText: string) => {
    if (isUserLoading) return;
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const existingId = resolveExistingConversationId();

    const resultId = chatHistory.sendMessage({
      conversationId: existingId,
      surface,
      contextId,
      seedMessages: existingId ? [] : localSeedMessages.map(toStoredMessage),
      userContent: displayText,
      fetcher: (token, signal) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/query/faq/${faqId}?${new URLSearchParams(
            { model: selectedModel },
          ).toString()}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
            signal,
          },
        ),
    });

    bindIfNewConversation(existingId, resultId);
  };

  const handleStopRequest = () => {
    if (boundConversationId) {
      chatHistory.stopGenerating(boundConversationId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      <Card className="h-full flex flex-col shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MessageSquare className="h-5 w-5" />
            {cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}
                      {message.role === "assistant" &&
                        message.modelUsed === "local-model" && (
                          <div className="mt-2 text-xs text-slate-500">
                            Responded via Local LLM
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {isInitialLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing biomodel...</span>
                    </div>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <div className="border-t border-slate-200 p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as ModelId)}
            >
              <SelectTrigger
                className="h-10 w-[136px] border-slate-300 bg-white text-slate-700"
                aria-label="Model"
                disabled={isLoading || isInitialLoading}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai-model">OpenAI</SelectItem>
                <SelectItem value="local-model">Local LLM</SelectItem>
              </SelectContent>
            </Select>
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask any questions about VCell biomodels..."
              className="flex-1 border-slate-300 focus:border-blue-500"
              disabled={isLoading || isInitialLoading}
            />
            <Button
              onClick={() =>
                isLoading ? handleStopRequest() : handleSendMessage()
              }
              disabled={
                isInitialLoading || (!isLoading && !inputMessage.trim())
              }
              title={isLoading ? "Stop generating" : "Send message"}
              className={
                isLoading
                  ? "bg-red-600 hover:bg-red-700 text-white px-4"
                  : "bg-blue-600 hover:bg-blue-700 text-white px-4"
              }
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions - positioned directly under search bar */}
          {!isInitialLoading && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="h-4 px-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action.icon}
                    <span className="ml-0.5">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {supplementalActions && (
            <div className="mt-3 pt-3 border-t-2 border-slate-200">
              <div className="flex flex-wrap gap-1">
                {supplementalActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="h-4 px-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action.icon}
                    <span className="ml-0.5">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
