"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Search,
  FileText,
  BarChart3Icon as Diagram3,
  Loader2,
  MessageSquare,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Dna,
  Gauge,
  FlaskRoundIcon as Flask,
  Atom,
  Briefcase,
  Cog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import XMLViewer from 'react-xml-viewer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AnalysisState {
  status: "input" | "loading" | "results"
  biomodelId: string
  prompt: string
  results: {
    title: string
    description: string
    diagram: string
    vcml: string
    aiAnalysis: string
    vcmlAnalysis: string
    followUpMessages: Message[]
  } | null
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface PromptTemplate {
  title: string
  prompt: string
  icon: React.ReactNode
  color: string
}

export default function AnalyzePage() {
  const [state, setState] = useState<AnalysisState>({
    status: "input",
    biomodelId: "",
    prompt: "",
    results: null,
  })

  const [followUpInput, setFollowUpInput] = useState("")
  const [isVcmlExpanded, setIsVcmlExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const promptTemplates: PromptTemplate[] = [
    {
      title: "Describe biology of the model",
      prompt: "Analyze and describe the biological context and significance of this model",
      icon: <Dna className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      title: "Describe parameters",
      prompt: "List and explain all parameters in this model and their biological significance",
      icon: <Gauge className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      title: "Describe species",
      prompt: "Identify all species in this model and explain their biological roles",
      icon: <Atom className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      title: "Describe reactions",
      prompt: "Analyze all reactions in this model and explain their mechanisms",
      icon: <Flask className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      title: "What Applications are used?",
      prompt: "Identify the applications and use cases for this biomodel",
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      title: "What solvers are used?",
      prompt: "Analyze the mathematical solvers and algorithms used in this model",
      icon: <Cog className="h-4 w-4" />,
      color: "bg-slate-100 text-slate-800 border-slate-200",
    },
  ]

  const handlePromptTemplateClick = (prompt: string) => {
    setState({ ...state, prompt })
  }

  const handleAnalyze = () => {
    if (!state.biomodelId.trim() || !state.prompt.trim()) return

    // Set loading state
    setState({ ...state, status: "loading" })

    // Still in development mode
    setTimeout(() => {
      const devResults = {
        title: "Still in development mode",
        description: "The biomodel analysis feature is currently under development.",
        diagram: "/placeholder.svg?height=600&width=800",
        vcml: "Still in development mode",
        aiAnalysis: "Still in development mode",
        vcmlAnalysis: "Still in development mode",
        followUpMessages: [
          {
            id: "1",
            role: "assistant" as "assistant",
            content: "Still in development mode",
          },
        ],
      }

      // Update state with dev results
      setState({
        ...state,
        status: "results",
        results: devResults,
      })
    }, 1000)
  }

  const handleFollowUpSubmit = () => {
    if (!followUpInput.trim() || !state.results) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: followUpInput,
    }

    setState({
      ...state,
      results: {
        ...state.results,
        followUpMessages: [...state.results.followUpMessages, userMessage],
      },
    })

    setFollowUpInput("")

    // Simulate AI response delay
    setTimeout(() => {
      // Development mode response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Still in development mode",
      }

      setState({
        ...state,
        results: {
          ...state.results!,
          followUpMessages: [...state.results!.followUpMessages, aiResponse],
        },
      })

      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }, 1500)
  }

  const generateMockResponse = (query: string): string => {
    return "Still in development mode"
  }

  const handleReset = () => {
    setState({
      status: "input",
      biomodelId: "",
      prompt: "",
      results: null,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-6xl">
        {state.status === "input" && (
          <div className="space-y-8">
            {/* Bold Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Biomodel AI Analysis</h1>
            </div>

            {/* Two large search bars side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Enter biomodel ID"
                value={state.biomodelId}
                onChange={(e) => setState({ ...state, biomodelId: e.target.value })}
                className="text-xl h-16 px-6 border-2 border-slate-300 focus:border-blue-500 rounded-xl"
              />
              <Input
                placeholder="What would you like to know?"
                value={state.prompt}
                onChange={(e) => setState({ ...state, prompt: e.target.value })}
                className="text-xl h-16 px-6 border-2 border-slate-300 focus:border-blue-500 rounded-xl"
              />
            </div>

            {/* Small quick action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {promptTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePromptTemplateClick(template.prompt)}
                  className={`text-xs py-1 px-3 ${template.color}`}
                >
                  <div className="flex items-center gap-1">
                    {template.icon}
                    <span>{template.title}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleAnalyze}
                disabled={!state.biomodelId.trim() || !state.prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-xl"
              >
                <Search className="h-6 w-6 mr-2" />
                Analyze Biomodel
              </Button>
            </div>
          </div>
        )}

        {state.status === "loading" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 mb-6">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Analyzing Biomodel</h2>
            <p className="text-slate-600 mb-8 text-center max-w-md">
              Our AI is processing the biomodel data and generating comprehensive insights...
            </p>
            <div className="w-full max-w-md bg-slate-100 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {state.status === "results" && state.results && (
          <div className="space-y-12">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{state.results.title}</h2>
                <p className="text-slate-600">{state.results.description}</p>
              </div>
              <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                New Analysis
              </Button>
            </div>

            {/* Diagram Section */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Diagram3 className="h-5 w-5" />
                  Biomodel Diagram
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 w-full">
                    <img
                      src={state.results.diagram || "/placeholder.svg"}
                      alt="Biomodel Diagram"
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  AI Analysis
                </h3>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{state.results.aiAnalysis}</div>
                </div>
              </div>
            </div>

            {/* VCML File Section */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      VCML File
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVcmlExpanded(!isVcmlExpanded)}
                      className="flex items-center gap-1"
                    >
                      {isVcmlExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>Expand</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <XMLViewer xml={state.results.vcml} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* VCML Analysis Section */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  VCML Analysis
                </h3>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{state.results.vcmlAnalysis}</div>
                </div>
              </div>
            </div>

            {/* Follow-up Questions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <MessageSquare className="h-5 w-5" />
                  Follow-up Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-6">
                  <div className="space-y-4">
                    {state.results.followUpMessages.map((message) => (
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
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t border-slate-200 p-4">
                  <div className="flex w-full gap-2">
                    <Input
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      placeholder="Ask a follow-up question about this biomodel..."
                      className="flex-1 border-slate-300 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleFollowUpSubmit()
                        }
                      }}
                    />
                    <Button
                      onClick={handleFollowUpSubmit}
                      disabled={!followUpInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
