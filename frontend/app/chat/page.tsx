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
  Code,
  BarChart3Icon as Diagram3,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolParameters } from "@/components/ToolParameters"

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

  const generateAIResponse = (userMessage: string): { content: string; toolUsed?: string; toolParams?: any } => {
    const lowerMessage = userMessage.toLowerCase()

    // Biomodel search responses
    if (lowerMessage.includes("search") || lowerMessage.includes("find") || lowerMessage.includes("biomodel")) {
      const mockResults = [
        {
          bmId: 123456789,
          name: "Cardiac Myocyte Calcium Dynamics",
          ownerName: "Dr. Smith",
          savedDate: "2024-01-15T10:30:00Z",
          simulations: 15,
        },
        {
          bmId: 987654321,
          name: "Neural Network Synaptic Transmission",
          ownerName: "Prof. Johnson",
          savedDate: "2024-01-10T14:20:00Z",
          simulations: 8,
        },
      ]

      return {
        content: `I found ${mockResults.length} biomodels matching your criteria:\n\n${mockResults
          .map(
            (model) =>
              `• **${model.name}** (ID: ${model.bmId})\n  Owner: ${model.ownerName}\n  Simulations: ${model.simulations}\n}`,
          )
          .join("\n\n")}\n\nWould you like me to retrieve VCML/SBML files or diagrams for any of these models?`,
        toolUsed: "biomodel_search",
        toolParams: parameters,
      }
    }

    // VCML retrieval responses
    if (lowerMessage.includes("vcml") || lowerMessage.includes("virtual cell")) {
      return {
        content: `I can retrieve the VCML file for biomodel ID. VCML (Virtual Cell Markup Language) files contain the complete model definition including:\n\n• Compartment structures\n• Species definitions\n• Reaction kinetics\n• Mathematical descriptions\n• Simulation parameters\n\nPlease provide a specific biomodel ID, and I'll fetch the VCML content for you.`,
        toolUsed: "vcml_retrieval",
      }
    }

    // SBML retrieval responses
    if (lowerMessage.includes("sbml") || lowerMessage.includes("systems biology")) {
      return {
        content: `I can retrieve the SBML file for any biomodel. SBML (Systems Biology Markup Language) files provide:\n\n• Standardized model representation\n• Species and compartment definitions\n• Reaction networks\n• Mathematical expressions\n• Parameter values\n\nSBML format is widely supported by systems biology tools. Which biomodel ID would you like the SBML file for?`,
        toolUsed: "sbml_retrieval",
      }
    }

    // Diagram responses
    if (lowerMessage.includes("diagram") || lowerMessage.includes("visual") || lowerMessage.includes("image")) {
      return {
        content: `I can generate diagram visualizations for biomodels. These diagrams show:\n\n• Network topology\n• Compartment organization\n• Species interactions\n• Reaction pathways\n• Flux directions\n\nThe diagrams are generated in real-time and can be viewed directly in your browser. Which biomodel would you like to visualize?`,
        toolUsed: "diagram_retrieval",
      }
    }

    // Calcium-related responses
    if (lowerMessage.includes("calcium") || lowerMessage.includes("ca2+")) {
      return {
        content: `I found several calcium-related biomodels in the database:\n\n• **Cardiac Myocyte Calcium Dynamics** - Models calcium handling in heart cells including L-type channels, ryanodine receptors, and SERCA pumps\n• **Neuronal Calcium Signaling** - Describes calcium dynamics in neurons and synaptic transmission\n• **Smooth Muscle Calcium Regulation** - Models calcium-induced calcium release in vascular smooth muscle\n\nWould you like me to search for more specific calcium models or retrieve files for any of these?`,
        toolUsed: "biomodel_search",
        toolParams: { ...parameters, bmName: "calcium" },
      }
    }

    // General help responses
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return {
        content: `I can help you with several VCell operations:\n\n🔍 **Biomodel Search**: Find models using various filters (name, owner, category, date range)\n📄 **VCML Retrieval**: Get Virtual Cell Markup Language files\n🧬 **SBML Retrieval**: Download Systems Biology Markup Language files\n📊 **Diagram Visualization**: Generate network diagrams\n\nYou can adjust the search parameters below and ask me questions like:\n• "Find cardiac models from Dr. Smith"\n• "Get the VCML file for biomodel 123456"\n• "Show me a diagram for model 789012"\n• "Search for calcium signaling models"`,
      }
    }

    // Default response
    return {
      content: `I understand you're asking about "${userMessage}". I can help you search for biomodels, retrieve VCML/SBML files, and generate diagrams. \n\nCould you be more specific about what you'd like to do? For example:\n• Search for specific biomodels\n• Retrieve files for a particular model ID\n• Generate visualizations\n\nFeel free to adjust the search parameters below to refine your queries.`,
    }
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

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
        toolUsed: aiResponse.toolUsed,
        toolParams: aiResponse.toolParams,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getToolIcon = (toolUsed?: string) => {
    switch (toolUsed) {
      case "biomodel_search":
        return <Search className="h-3 w-3" />
      case "vcml_retrieval":
        return <FileText className="h-3 w-3" />
      case "sbml_retrieval":
        return <Code className="h-3 w-3" />
      case "diagram_retrieval":
        return <Diagram3 className="h-3 w-3" />
      default:
        return null
    }
  }

  const getToolName = (toolUsed?: string) => {
    switch (toolUsed) {
      case "biomodel_search":
        return "Biomodel Search"
      case "vcml_retrieval":
        return "VCML Retrieval"
      case "sbml_retrieval":
        return "SBML Retrieval"
      case "diagram_retrieval":
        return "Diagram Generation"
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Assistant</h1>
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
                            {message.toolUsed && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <Badge variant="secondary" className="text-xs">
                                  {getToolIcon(message.toolUsed)}
                                  <span className="ml-1">{getToolName(message.toolUsed)}</span>
                                </Badge>
                              </div>
                            )}
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
    </div>
  )
}