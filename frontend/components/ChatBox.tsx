import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";

import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
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
  database?: "vcdb" | "bmdb";
  startMessage: string | string[];
  quickActions: QuickAction[];
  VCellActions?: QuickAction[];
  bmdbActions?: QuickAction[];
  cardTitle: string;
  promptPrefix?: string;
  isLoading?: boolean;
  parameters?: ChatParameters;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  database,
  startMessage,
  quickActions,
  VCellActions,
  bmdbActions,
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

  const [messages, setMessages] = useState<Message[]>(() => {
    return createInitialMessages(startMessage);
});

  const searchParams = useSearchParams();

  useEffect(() => {
  const id = searchParams.get("conversation");

  if (id) {
    const stored = localStorage.getItem("chat_conversations");
    if (!stored) return;

    const conversations = JSON.parse(stored);
    const convo = conversations.find((c: any) => c.id === id);

    if (convo) {
  setMessages(convo.messages);
  setConversationId(id); 
}
  } else {
    setMessages(createInitialMessages(startMessage));
  }
}, [searchParams, startMessage]);


  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [useVCDB, setUseVCDB] = useState(database ? database === "vcdb" : true);
  const [useBMDB, setUseBMDB] = useState(database === "bmdb");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const abortController = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


useEffect(() => {
  if (messages.length === 0) return;
  const hasUserMessage = messages.some((m) => m.role === "user");
  if (!hasUserMessage) return;

  saveConversation(messages);

  window.dispatchEvent(new Event("conversation-updated"));
}, [messages]);

const saveConversation = (messages: Message[]) => {
  if (messages.length === 0) return;

  const stored = localStorage.getItem("chat_conversations");
  const conversations = stored ? JSON.parse(stored) : [];

  let id = conversationId;

  // If no conversation yet then create a new one
  if (!id) {
    id = crypto.randomUUID();
    setConversationId(id);

    const firstUserMessage = messages.find((m) => m.role === "user");

    const newConversation = {
      id,
      title: firstUserMessage?.content.slice(0, 40) || "Chat",
      messages,
    };

    conversations.unshift(newConversation);
  } else {
    // Update existing conversation
    const index = conversations.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      conversations[index].messages = messages;
    }
  }

  localStorage.setItem("chat_conversations", JSON.stringify(conversations));
};

  const activeActions = [
    ...(useVCDB && VCellActions ? VCellActions : []),
    ...(useBMDB && bmdbActions ? bmdbActions : []),
  ];

  const handleQuickAction = (message: string) => {
    setInputMessage("");
    if (database) {
      if (database == "vcdb") {
        handleSendMessage(message);
      } else if (database == "bmdb") {
        handleSendMessage2(message);
      }
    } else {
      handleSend(message)
    }
  };

  const handleSend = (inputMessage: string) => {
  if (!inputMessage.trim()) return;
  if (!useVCDB && !useBMDB) {
    alert("Please select at least one database.");
    return;
  }
  const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

  if (useVCDB) {handleSendMessage(inputMessage);}
  if (useBMDB){handleSendMessage2(inputMessage);}
};

  const handleSendMessage = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage;
    if (!msg.trim()) return;

    const controller = new AbortController();
    abortController.current = controller;

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

    console.log("PPPPPP: " + "This is the msg: " + msg);
    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   role: "user",
    //   content: msg,
    //   timestamp: new Date(),
    // };
    // setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    try {
      const finalPrompt = promptPrefix
        ? `${promptPrefix} ${msg}${parameterContext}`
        : `${msg}${parameterContext}`;
      console.log("RRRRRR: " + "This is the promptPrefix: " + promptPrefix);
      console.log("RRRRRR: " + "This is the finalPrompt sent to backend: " + finalPrompt);

      const systemMessages = messages.filter((m) => m.role === "system");
      const recentNonSystem = messages.filter((m) => m.role !== "system").slice(-5);

      const historyToSend = [
      ...systemMessages,
      ...recentNonSystem,
      { role: "user", content: finalPrompt },
      ].map((msg) => ({ role: msg.role, content: msg.content }));


      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ conversation_history: historyToSend }),
//JSON.stringify({
          //   conversation_history: [
          //     ...messages,
          //     { role: "user", content: finalPrompt },
          //   ].map(msg => ({
          //     role: msg.role,
          //     content: msg.content,
          //   })),
          // }),
          signal: controller.signal,
        },
      );
      console.log("AAAAAA API query sent to backend: " + finalPrompt);
      const data = await res.json();
      const aiResponse =
        data.response || "Sorry, I didn't get a response from the server.";
      const bmkeys = data.bmkeys || [];

      // Format the response to include hyperlinks for biomodel IDs
      //const formattedResponse = formatBiomodelIds(aiResponse, bmkeys);
      const formattedResponse = aiResponse

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: useVCDB && useBMDB
                ? `**VCell Database:**\n\n${formattedResponse}`
                : formattedResponse,
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
  }; // End of handleSendMessage

// 
const handleSendMessage2 = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage;
    if (!msg.trim()) return;
    const controller = new AbortController();
    abortController.current = controller;
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

    console.log("PPPPPP: " + "This is the msg: " + msg);
    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   role: "user",
    //   content: msg,
    //   timestamp: new Date(),
    // };
    // setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    try {
      const finalPrompt = promptPrefix
        ? `${promptPrefix} ${msg}${parameterContext}`
        : `${msg}${parameterContext}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/biomd-search`,
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
          signal: controller.signal,
        },
      );
      const data = await res.json();
      const aiResponse =
        data.response || "Sorry, I didn't get a response from the server.";
      const bmkeys = data.bmkeys || [];

      console.log(bmkeys)
      // Format the response to include hyperlinks for biomodel IDs
      //const formattedResponse = formatBiomodelIds(aiResponse, bmkeys);
      const formattedResponse = aiResponse

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: useVCDB && useBMDB
                ? `**BIOMD Database:**\n\n${formattedResponse}`
                : formattedResponse,
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
  }; // End of handleSendMessage2



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputMessage);
    }
  };

  const handleStop = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Response stopped by user.",
          timestamp: new Date(),
        },
      ]);

      setIsLoading(false);
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
                // User messages are right-aligned, assistant messages are left-aligned
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 ${
                    // User messages are right-aligned and take up to 80% width
                    // assistant messages are left-aligned and take full width
                    message.role === "user" ? "flex-row-reverse max-w-[80%]" : "flex-row w-full"
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
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useVCDB}
              onChange={(e) => setUseVCDB(e.target.checked)}
            />
            VCell DB
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useBMDB}
              onChange={(e) => setUseBMDB(e.target.checked)}
            />
            BioModels DB
          </label>
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={useVCDB && useBMDB
                          ? "Ask about VCell and BioModels biomodels..."
                          : useVCDB
                          ? "Ask about VCell biomodels..."
                          : "Ask about BioModels biomodels..."
                        }
            className="flex-1 border-slate-300 focus:border-blue-500"
            disabled={isLoading || isInitialLoading}
          />
          <Button
            onClick={() => handleSend(inputMessage)}
            disabled={isLoading || isInitialLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleStop}
            className="bg-blue-500 hover:bg-gray-600 text-white"
          >
            Stop
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

      
        {useVCDB && !useBMDB && VCellActions && (
          <div className="mt-3 pt-3 border-t-2 border-slate-200">
            <div className="flex flex-wrap gap-1">
              {VCellActions.map((action, idx) => (
                <Button key={idx} variant="ghost" size="sm" className="h-4 px-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => handleQuickAction(action.value)}>
                  {action.icon}
                  <span className="ml-0.5">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {useBMDB && !useVCDB && bmdbActions && (
          <div className="mt-3 pt-3 border-t-2 border-slate-200">
            <div className="flex flex-wrap gap-1">
              {bmdbActions.map((action, idx) => (
                <Button key={idx} variant="ghost" size="sm" className="h-4 px-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => handleQuickAction(action.value)}>
                  {action.icon}
                  <span className="ml-0.5">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {useVCDB && useBMDB && activeActions.length > 0 && (
          <div className="mt-3 pt-3 border-t-2 border-slate-200">
            <div className="flex flex-wrap gap-1">
              {activeActions.map((action, idx) => (
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
