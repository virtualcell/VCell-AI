"use client"

import React from "react"
import { useState } from "react"
import {
  Search,
  MessageSquare,
  Loader2,
  Dna,
  Gauge,
  FlaskRoundIcon as Flask,
  Atom,
  Briefcase,
  Cog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DiagramSection } from "@/components/DiagramSection"
import { VCMLSection } from "@/components/VCMLSection"
import { ChatBox } from "@/components/ChatBox"

interface AnalysisState {
  status: "input" | "loading" | "results"
  biomodelId: string
  prompt: string
  results: {
    title: string
    description: string
    diagram: string
    vcml: string
    diagramAnalysis: string
    vcmlAnalysis: string
    aiAnalysis: string
  } | null
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

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const promptTemplates: PromptTemplate[] = [
    {
      title: "Describe biology of the model",
      prompt: "Describe biology of the model",
      icon: <Dna className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      title: "Describe parameters",
      prompt: "Describe parameters",
      icon: <Gauge className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      title: "Describe species",
      prompt: "Describe species",
      icon: <Atom className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      title: "Describe reactions",
      prompt: "Describe reactions",
      icon: <Flask className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      title: "What Applications are used?",
      prompt: "What Applications are used?",
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      title: "What solvers are used?",
      prompt: "What solvers are used?",
      icon: <Cog className="h-4 w-4" />,
      color: "bg-slate-100 text-slate-800 border-slate-200",
    },
  ]

  const handlePromptTemplateClick = (prompt: string) => {
    setState({ ...state, prompt })
  }

  // Updated handleAnalyze to only handle the analysis endpoint
  const handleAnalyze = async () => {
    if (!state.biomodelId.trim() || !state.prompt.trim()) return
    setState({ ...state, status: "loading" })
    setIsLoading(true)
    setError("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      // Call the /analyse endpoint
      const analyseRes = await fetch(`${apiUrl}/analyse/${state.biomodelId}?user_prompt=${encodeURIComponent(state.prompt)}`, {
        method: 'POST',
        headers: { 'accept': 'application/json' },
      })
      if (!analyseRes.ok) throw new Error("Failed to analyze biomodel.")
      const analyseData = await analyseRes.json()

      // Use the response fields for analysis
      const aiAnalysis = analyseData.response?.ai_analysis || "No AI analysis available."
      const diagramAnalysis = analyseData.response?.diagram_analysis || "No diagram analysis available."
      const vcmlAnalysis = analyseData.response?.vcml_analysis || "No VCML analysis available."

      setState({
        ...state,
        status: "results",
        results: {
          title: `Analysis for Biomodel ${state.biomodelId}`,
          description: `Results for biomodel ID ${state.biomodelId}.`,
          diagram: "",
          vcml: "",
          diagramAnalysis,
          vcmlAnalysis,
          aiAnalysis,
        },
      })
    } catch (err) {
      setError("Failed to analyze biomodel.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setState({
      status: "input",
      biomodelId: "",
      prompt: "",
      results: null,
    })
  }

  const quickActions = promptTemplates.map(template => ({
    label: template.title,
    icon: template.icon,
    value: template.prompt
  }))

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

            {/* Diagram and Analysis Sections */}
            <DiagramSection 
              biomodelId={state.biomodelId}
              diagramAnalysis={state.results.diagramAnalysis}
            />

            {/* VCML Sections */}
            <VCMLSection 
              biomodelId={state.biomodelId}
              vcmlAnalysis={state.results.vcmlAnalysis}
            />

            {/* Chat Box */}
            <ChatBox
              startMessage={state.results.aiAnalysis}
              quickActions={quickActions}
              cardTitle="Follow-up Questions"
              promptPrefix={`Analyze the biomodel with the bmId ${state.biomodelId} for the following question: ${state.prompt}`}
            />
          </div>
        )}
      </div>
    </div>
  )
}