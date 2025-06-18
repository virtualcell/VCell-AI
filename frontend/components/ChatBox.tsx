import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface QuickAction {
  label: string
  icon: React.ReactNode
  value: string
}

interface ChatBoxProps {
  startMessage: string
  quickActions: QuickAction[]
  cardTitle: string
  promptPrefix?: string
}

export const ChatBox: React.FC<ChatBoxProps> = ({ startMessage, quickActions, cardTitle, promptPrefix }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: startMessage,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Helper function to format biomodel IDs as hyperlinks
  const formatBiomodelIds = (content: string, bmkeys: string[]): string => {
    if (!bmkeys || bmkeys.length === 0) return content
    
    let formattedContent = content
    
    // Replace biomodel IDs with hyperlinks
    bmkeys.forEach(bmId => {
      const regex = new RegExp(`\\b${bmId}\\b`, 'g')
      const encodedPrompt = encodeURIComponent(`Describe model`)
      const link = `[${bmId}](/analyze/${bmId}?prompt=${encodedPrompt})`
      formattedContent = formattedContent.replace(regex, link)
    })
    
    return formattedContent
  }

  const handleQuickAction = (message: string) => {
    setInputMessage("")
    handleSendMessage(message)
  }

  const handleSendMessage = async (overrideMessage?: string) => {
    const msg = overrideMessage ?? inputMessage
    if (!msg.trim()) return
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    try {
      const finalPrompt = promptPrefix ? `${promptPrefix} ${msg}` : msg
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/query?user_prompt=${encodeURIComponent(finalPrompt)}`,
        {
          method: "POST",
          headers: { accept: "application/json" },
          body: "",
        },
      )
      const data = await res.json()
      const aiResponse = data.response || "Sorry, I didn't get a response from the server."
      const bmkeys = data.bmkeys || []
      
      // Format the response to include hyperlinks for biomodel IDs
      const formattedResponse = formatBiomodelIds(aiResponse, bmkeys)
      
      console.log(formattedResponse)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formattedResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "There was an error connecting to the backend. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col shadow-sm border-slate-200">
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
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-slate-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 max-w-[80%]">
                <div className="text-sm text-slate-600 mb-3">Try these quick actions:</div>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                      onClick={() => handleQuickAction(action.value)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
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
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 