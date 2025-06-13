"use client"

import React from "react"

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
  icon: React.ReactElement<any>
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [diagramInfo, setDiagramInfo] = useState<any>(null)
  const [vcmlContent, setVcmlContent] = useState("")
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

  // Fetch VCML file from backend
  const handleRetrieveVcml = async (biomodelId: string) => {
    setIsLoading(true)
    setError("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/biomodel.vcml`)
      if (!res.ok) {
        setError("Failed to fetch VCML from backend.")
        setVcmlContent("")
        return ""
      } else {
        let text = await res.text()
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1)
        }
        setVcmlContent(text)
        return text
      }
    } catch (err) {
      setError("Failed to fetch VCML from backend.")
      setVcmlContent("")
      return ""
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch diagram image from backend
  const handleRetrieveDiagram = async (biomodelId: string) => {
    setIsLoading(true)
    setError("")
    setDiagramInfo(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/diagram/image`)
      const contentType = res.headers.get("content-type")
      if (res.ok && contentType && contentType.startsWith("image")) {
        const blob = await res.blob()
        const imageUrl = URL.createObjectURL(blob)
        const info = {
          url: imageUrl,
          title: `Diagram for Biomodel ${biomodelId}`,
          format: contentType.split("/")[1].toUpperCase(),
        }
        setDiagramInfo(info)
        return info
      } else if (contentType && contentType.includes("application/json")) {
        const data = await res.json()
        setError(data.detail || "Diagram not found.")
        return null
      } else {
        setError("Unexpected response from server.")
        return null
      }
    } catch (err) {
      setError("Failed to fetch diagram.")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Updated handleAnalyze to fetch VCML and diagram
  const handleAnalyze = async () => {
    if (!state.biomodelId.trim() || !state.prompt.trim()) return
    setState({ ...state, status: "loading" })
    setIsLoading(true)
    setError("")
    try {
      const [vcml, diagram] = await Promise.all([
        handleRetrieveVcml(state.biomodelId),
        handleRetrieveDiagram(state.biomodelId),
      ])
      // Placeholder for AI analysis and VCML analysis
      const aiAnalysis = "AI analysis is under development."
      const vcmlAnalysis = "VCML analysis is under development."
      setState({
        ...state,
        status: "results",
        results: {
          title: `Analysis for Biomodel ${state.biomodelId}`,
          description: `Results for biomodel ID ${state.biomodelId}.`,
          diagram: diagram?.url || "",
          vcml: vcml || "",
          aiAnalysis,
          vcmlAnalysis,
          followUpMessages: [],
        },
      })
    } catch (err) {
      setError("Failed to analyze biomodel.")
    } finally {
      setIsLoading(false)
    }
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

  const handleReset = () => {
    setState({
      status: "input",
      biomodelId: "",
      prompt: "",
      results: null,
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center text-slate-900">
      <div className="container mx-auto p-8 max-w-5xl">
        {state.status === "input" && (
          <div className="space-y-10 flex flex-col items-center">
            {/* Enhanced Header */}
            <div className="text-center mb-10">
              <h1 className="text-7xl font-extrabold text-blue-600 mb-3">
                Biomodel AI Analysis
              </h1>
              <p className="text-slate-500 text-lg">
                Unlock insights from your biomodels with the power of AI.
              </p>
            </div>

            {/* Enhanced Two large search bars side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-center">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input
                  placeholder="Enter BioModel ID (e.g., 12345)"
                  value={state.biomodelId}
                  onChange={(e) => setState({ ...state, biomodelId: e.target.value })}
                  className="text-xl h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl shadow-sm transition-all duration-300 ease-in-out text-slate-900 placeholder-slate-400"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input
                  placeholder="What would you like to analyze?"
                  value={state.prompt}
                  onChange={(e) => setState({ ...state, prompt: e.target.value })}
                  className="text-xl h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl shadow-sm transition-all duration-300 ease-in-out text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Enhanced Example Prompts */}
            <div className="w-full max-w-4xl pt-4">
              <p className="text-center text-slate-500 mb-5 text-sm">Or try one of these example prompts:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {promptTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptTemplateClick(template.prompt)}
                    className={`group flex items-center justify-start text-left p-3 rounded-lg border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-500 transition-all duration-200 ease-in-out shadow-xs text-slate-700 hover:text-blue-600`}
                  >
                    <div className={`mr-3 p-1.5 rounded-md ${template.color.replace("bg-", "bg-opacity-10 ").replace("text-", "text-").replace("border-", "border-opacity-20 ")}`}>
                      {React.cloneElement(template.icon, { className: "h-5 w-5" })}
                    </div>
                    <span className="text-xs font-medium group-hover:font-semibold">{template.title}</span>
                  </Button>
                ))}
              </div>
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
