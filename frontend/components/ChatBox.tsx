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
  // Helper function to create initial messages from startMessage.
  // Accepts either a single string or an array of strings (for multi-message
  // greetings), and wraps each in the Message shape with a fresh timestamp.
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

  // Scroll to the latest message whenever the messages array changes.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Re-initialise messages when startMessage changes (e.g. after an async
  // analysis finishes and the parent passes in a new greeting/summary).
  // We skip this while the initial load spinner is still showing so we don't
  // overwrite an in-progress loading state.
  useEffect(() => {
    if (startMessage && !isInitialLoading) {
      setMessages(createInitialMessages(startMessage));
    }
  }, [startMessage, isInitialLoading]);

  // Replaces raw biomodel ID strings in the AI response with a markdown link
  // to the database details page, so users can click through directly.
  const formatBiomodelIds = (content: string, bmkeys: string[]): string => {
    if (!bmkeys || bmkeys.length === 0) return content;

    let formattedContent = content;

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

  // Clears the controlled input then immediately fires the chosen quick-action
  // message so there is no flash of the action text in the input box.
  const handleQuickAction = (message: string) => {
    setInputMessage("");
    handleSendMessage(message);
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage;
    if (!msg.trim()) return;

    // Build an optional parameter context string that is appended to the
    // user's prompt so the LLM knows about any active search filters
    // (biomodel ID, owner, date range, etc.) without the user having to
    // repeat them in every message.
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
      // Prefix the prompt if the parent supplied one (e.g. "Analyse biomodel:")
      // and always append the parameter context so the LLM has full context.
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
          // Send only role + content to the backend — strip client-side
          // fields like id and timestamp that the API does not expect.
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

      // Post-process the AI response to turn plain biomodel ID strings into
      // clickable markdown links before storing in state.
      const formattedResponse = formatBiomodelIds(aiResponse, bmkeys);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formattedResponse,
        // CHANGED: We now use the server-provided timestamp when available
        // (data.timestamp is an ISO string returned by the /query endpoint).
        // Falling back to new Date() keeps things working even if the backend
        // hasn't been updated yet or returns an unexpected shape.
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Surface a user-friendly error bubble instead of a silent failure.
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

  // Send on Enter, but allow Shift+Enter for multi-line input in the future.
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // CHANGED: Helper that formats a Date object into a short "HH:MM AM/PM"
  // string shown beneath each message bubble.
  // Kept as a separate function so it's easy to swap the format later
  // (e.g. add seconds, switch to 24-hour) without touching the JSX.
  const formatTime = (date: Date): string =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
                  {/* Avatar circle — blue for user, grey for assistant */}
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

                  {/* Message bubble */}
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
                      // Assistant messages are rendered as Markdown so the LLM
                      // can use headings, bullet lists, code blocks, etc.
                      <MarkdownRenderer content={message.content} />
                    )}

                    {/*
                      CHANGED: Timestamp label below every message bubble.
                      - For user messages it sits on the right (matching the
                        bubble alignment) using `text-right`.
                      - For assistant messages it aligns left.
                      - The muted colour (text-blue-200 / text-slate-400) keeps
                        it subtle so it doesn't compete with the message text.
                      - formatTime() produces a short locale-aware string like
                        "02:34 PM" — readable without taking up much space.
                    */}
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-blue-200 text-right"
                          : "text-slate-400 text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Spinner shown while the parent is fetching the initial analysis */}
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

            {/* Spinner shown while waiting for the LLM response */}
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

          {/* Invisible anchor that we scroll into view after every new message */}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      {/* Input area — always pinned to the bottom of the card */}
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

        {/* Quick Actions — one-tap prompts shown under the input bar.
            Hidden while the initial loading spinner is active so the user
            can't fire a query before the first analysis has finished. */}
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

        {/* Supplemental Actions — an optional second row of actions (e.g. admin
            shortcuts) separated by a slightly heavier border. */}
        {supplementalActions && (
          <div className="mt-3 pt-3 border-t-2 border-slate-200">
            <div className="flex flex-wrap gap-1">
              {supplementalActions.map((action, idx) => (
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
      </div>
    </Card>
  );
};
