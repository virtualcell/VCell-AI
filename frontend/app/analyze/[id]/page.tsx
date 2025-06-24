"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Dna, Gauge, FlaskConical, Atom, Briefcase, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiagramSection } from "@/components/DiagramSection"
import { VCMLSection } from "@/components/VCMLSection"
import { ChatBox } from "@/components/ChatBox"

interface AnalysisResults {
  title: string
  description: string
  aiAnalysis: string
}

export default function AnalysisResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  
  // Unwrap the params Promise
  const { id } = React.use(params)
  
  const [error, setError] = useState("")
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const url = new URL(`${apiUrl}/analyse/${id}`)
        if (prompt) {
          url.searchParams.set('user_prompt', prompt)
        }
        
        const analyseRes = await fetch(url.toString(), {
          method: 'POST',
          headers: { 
            'accept': 'application/json' 
          }
        })
        
        if (!analyseRes.ok) throw new Error("Failed to analyze biomodel.")
        const analyseData = await analyseRes.json()

        setResults({
          title: `Analysis for Biomodel ${id}`,
          description: `Results for biomodel ID ${id}.`,
          aiAnalysis: analyseData.response || "No AI analysis available.",
        })
      } catch (err) {
        setError("Failed to analyze biomodel.")
      } finally {
        setIsAnalysisLoading(false)
      }
    }

    fetchAnalysis()
  }, [id, prompt])

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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
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
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {results?.title || `Analysis for Biomodel ${id}`}
              </h2>
              <p className="text-slate-600 text-sm">
                {results?.description || `Results for biomodel ID ${id}.`}
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              New Analysis
            </Button>
          </div>

          {/* Chat Box */}
          <ChatBox
            startMessage={results?.aiAnalysis || ""}
            quickActions={quickActions}
            cardTitle="VCell AI Assistant"
            promptPrefix={`Analyze the biomodel with the bmId ${id} for the following question: ${prompt}`}
            isLoading={isAnalysisLoading}
          />

          {/* Diagram and Analysis Sections */}
          <DiagramSection biomodelId={id} />

          {/* VCML Sections */}
          <VCMLSection biomodelId={id} />
        </div>
      </div>
    </div>
  )
} 