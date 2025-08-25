import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  value: string;
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
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  startMessage,
  quickActions,
  supplementalActions,
  cardTitle,
  promptPrefix,
  isLoading: isInitialLoading = false,
  parameters,
}) => {
  // Helper function to create initial messages from startMessage
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

  const [messages, setMessages] = useState<Message[]>(
    createInitialMessages(startMessage),
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update messages when startMessage changes (when analysis completes)
  useEffect(() => {
    if (startMessage && !isInitialLoading) {
      setMessages(createInitialMessages(startMessage));
    }
  }, [startMessage, isInitialLoading]);

  // Helper function to format biomodel IDs as hyperlinks
  const formatBiomodelIds = (content: string, bmkeys: string[]): string => {
    if (!bmkeys || bmkeys.length === 0) return content;

    let formattedContent = content;

    // Replace biomodel IDs with hyperlinks
    bmkeys.forEach((bmId) => {
      const searchString = `${bmId}`;
      const encodedPrompt = encodeURIComponent(`Describe model`);
      /* const ai_link = `[AI Analysis](/analyze/${bmId}?prompt=${encodedPrompt})`;
      const db_link = `[Database](/search/${bmId})`;
      const replacementString = `**${bmId}** -- ${ai_link} &nbsp;|&nbsp; ${db_link}`; */
      const db_link = `[Database Details](/search/${bmId})`;
      const replacementString = `**${bmId}** || ${db_link}`;
      formattedContent = formattedContent.replaceAll(
        searchString,
        replacementString,
      );
    });

    return formattedContent;
  };

  const handleQuickAction = (message: string) => {
    setInputMessage("");
    handleSendMessage(message);
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage;
    if (!msg.trim()) return;
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    try {
      const finalPrompt = promptPrefix
        ? `${promptPrefix} ${msg}${parameterContext}`
        : `${msg}${parameterContext}`;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            conversation_history: [
              ...messages,
              { role: "user", content: finalPrompt },
            ].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        },
      );
      const data = await res.json();
      const aiResponse =
        data.response || "Sorry, I didn't get a response from the server.";
      const bmkeys = data.bmkeys || [];

      // Format the response to include hyperlinks for biomodel IDs
      const formattedResponse = formatBiomodelIds(aiResponse, bmkeys);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formattedResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "There was an error connecting to the backend. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
            onClick={() => handleSendMessage()}
            disabled={isLoading || isInitialLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
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
                  onClick={() => handleQuickAction(action.value)}
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
                <Button key={idx} variant="ghost" size="sm" className="h-4 px-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => handleQuickAction(action.value)}>
                  {action.icon}
                  <span className="ml-0.5">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
