"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Loader2, Dna, Gauge, FlaskConical, Atom, Briefcase, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiagramSection } from "@/components/DiagramSection"
import { VCMLSection } from "@/components/VCMLSection"
import { ChatBox } from "@/components/ChatBox"

interface AnalysisResults {
  title: string
  description: string
  diagram: string
  vcml: string
  diagramAnalysis: string
  vcmlAnalysis: string
  aiAnalysis: string
}

export default function AnalysisResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [results, setResults] = useState<AnalysisResults | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const analyseRes = await fetch(`${apiUrl}/analyse/${params.id}?user_prompt=${encodeURIComponent(prompt)}`, {
          method: 'POST',
          headers: { 'accept': 'application/json' },
        })
        
        if (!analyseRes.ok) throw new Error("Failed to analyze biomodel.")
        const analyseData = await analyseRes.json()

        setResults({
          title: `Analysis for Biomodel ${params.id}`,
          description: `Results for biomodel ID ${params.id}.`,
          diagram: "",
          vcml: "",
          diagramAnalysis: analyseData.response?.diagram_analysis || "No diagram analysis available.",
          vcmlAnalysis: analyseData.response?.vcml_analysis || "No VCML analysis available.",
          aiAnalysis: analyseData.response?.ai_analysis || "No AI analysis available.",
        })
      } catch (err) {
        setError("Failed to analyze biomodel.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [params.id, prompt])

  const handleReset = () => {
    router.push('/analyze')
  }

  const quickActions = [
    { label: "Describe biology of the model", value: "Describe biology of the model", icon: <Dna className="h-4 w-4" /> },
    { label: "Describe parameters", value: "Describe parameters", icon: <Gauge className="h-4 w-4" /> },
    { label: "Describe species", value: "Describe species", icon: <Atom className="h-4 w-4" /> },
    { label: "Describe reactions", value: "Describe reactions", icon: <FlaskConical className="h-4 w-4" /> },
    { label: "What Applications are used?", value: "What Applications are used?", icon: <Briefcase className="h-4 w-4" /> },
    { label: "What solvers are used?", value: "What solvers are used?", icon: <Cog className="h-4 w-4" /> },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-16">
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
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-slate-600 mb-8">{error || "Failed to load analysis results"}</p>
          <Button onClick={handleReset} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-8 max-w-5xl">
        <div className="space-y-12">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">{results.title}</h2>
              <p className="text-slate-600">{results.description}</p>
            </div>
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              New Analysis
            </Button>
          </div>

          {/* Diagram and Analysis Sections */}
          <DiagramSection 
            biomodelId={params.id}
            diagramAnalysis={results.diagramAnalysis}
          />

          {/* VCML Sections */}
          <VCMLSection 
            biomodelId={params.id}
            vcmlAnalysis={results.vcmlAnalysis}
          />

          {/* Chat Box */}
          <ChatBox
            startMessage={results.aiAnalysis}
            quickActions={quickActions}
            cardTitle="Follow-up Questions"
            promptPrefix={`Analyze the biomodel with the bmId ${params.id} for the following question: ${prompt}`}
          />
        </div>
      </div>
    </div>
  )
} 