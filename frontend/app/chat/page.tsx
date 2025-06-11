"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Search,
  FileText,
  BarChart3Icon as Diagram3,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolParameters } from "@/components/ToolParameters"
import { OnboardingModal } from "@/components/onboarding-modal"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolUsed?: string
  toolParams?: any
}

interface ChatParameters {
  bmName: string
  category: string
  owner: string
  savedLow: string
  savedHigh: string
  maxRows: number
  orderBy: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your VCell AI assistant. I can help you search for biomodels, retrieve VCML and SBML files, and access diagram visualizations. Choose a quick action below or ask me anything about biomodels!",
      timestamp: new Date(),
    },
  ])

  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [parameters, setParameters] = useState<ChatParameters>({
    bmName: "",
    category: "all",
    owner: "",
    savedLow: "",
    savedHigh: "",
    maxRows: 100,
    orderBy: "date_desc",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("vcell-ai-onboarding-seen")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingClose = () => {
    localStorage.setItem("vcell-ai-onboarding-seen", "true")
    setShowOnboarding(false)
  }

  const handleQuickAction = (message: string) => {
    setInputMessage(message)
    setShowQuickActions(false)
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    setShowQuickActions(false) // Hide quick actions when user starts chatting

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Send user message to backend
      const res = await fetch(
        `http://localhost:8000/query?user_prompt=${encodeURIComponent(inputMessage)}`,
        {
          method: "POST",
          headers: { accept: "application/json" },
          body: "",
        },
      )
      const data = await res.json()
      const aiResponse = data.response || "Sorry, I didn't get a response from the server."
      console.log("AI Response:", aiResponse)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              How to Use
            </Button>
          </div>
          <p className="text-slate-600">
            Interact with our AI assistant for biomodel analysis and research support with integrated tool access.
          </p>
        </div>

        {/* Persistent Warning */}
        <div className="mb-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Important:</strong> Responses are AI generated and may contain errors, or hallucinations. Please verify results using our available tools:{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                Biomodel Search
              </Link>
              ,{" "}
              <Link href="/vcml" className="text-blue-600 hover:underline">
                VCML
              </Link>
              ,{" "}
              <Link href="/sbml" className="text-blue-600 hover:underline">
                SBML
              </Link>
              ,{" "}
              <Link href="/diagrams" className="text-blue-600 hover:underline">
                Diagrams
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <MessageSquare className="h-5 w-5" />
                  VCell AI Assistant
                </CardTitle>
                <CardDescription>Ask questions about biomodels and use integrated analysis tools</CardDescription>
              </CardHeader>

              {/* Messages Area */}
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
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {showQuickActions && messages.length === 1 && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 max-w-[80%]">
                          <div className="text-sm text-slate-600 mb-3">Try these quick actions:</div>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleQuickAction("Search for cardiac calcium models")}
                            >
                              <Search className="h-3 w-3 mr-2" />
                              Search Cardiac Models
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleQuickAction("Get VCML file for biomodel 123456789")}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              Get VCML File
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleQuickAction("Show diagram for latest model")}
                            >
                              <Diagram3 className="h-3 w-3 mr-2" />
                              Generate Diagram
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleQuickAction("Help me understand biomodel formats")}
                            >
                              <MessageSquare className="h-3 w-3 mr-2" />
                              Learn About Formats
                            </Button>
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

              {/* Input Area */}
              <div className="border-t border-slate-200 p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about biomodels, request files, or generate diagrams..."
                    className="flex-1 border-slate-300 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Tool Parameters Panel */}
          <div className="lg:col-span-1">
            <ToolParameters parameters={parameters} onParametersChange={setParameters} />
          </div>
        </div>
      </div>
      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  )
}