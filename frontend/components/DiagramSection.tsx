import React, { useEffect, useState } from "react"
import { BarChart3Icon as Diagram3, Search, Loader2 } from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"

interface DiagramSectionProps {
  biomodelId: string
}

export const DiagramSection: React.FC<DiagramSectionProps> = ({ biomodelId }) => {
  const [diagramUrl, setDiagramUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [diagramAnalysis, setDiagramAnalysis] = useState<string>("")
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState("")

  useEffect(() => {
    const fetchDiagram = async () => {
      setIsLoading(true)
      setError("")
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/diagram/image`)
        const contentType = res.headers.get("content-type")
        if (res.ok && contentType && contentType.startsWith("image")) {
          const blob = await res.blob()
          const imageUrl = URL.createObjectURL(blob)
          setDiagramUrl(imageUrl)
        } else if (contentType && contentType.includes("application/json")) {
          const data = await res.json()
          setError(data.detail || "Diagram not found.")
        } else {
          setError("Unexpected response from server.")
        }
      } catch (err) {
        setError("Failed to fetch diagram.")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchDiagramAnalysis = async () => {
      setIsAnalysisLoading(true)
      setAnalysisError("")
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/analyse/${biomodelId}/diagram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (res.ok) {
          const data = await res.json()
          setDiagramAnalysis(data.response || "")
        } else {
          const errorData = await res.json()
          setAnalysisError(errorData.detail || "Failed to analyze diagram.")
        }
      } catch (err) {
        setAnalysisError("Failed to fetch diagram analysis.")
      } finally {
        setIsAnalysisLoading(false)
      }
    }

    if (biomodelId) {
      fetchDiagram()
      fetchDiagramAnalysis()
    }
  }, [biomodelId])

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Diagram3 className="h-4 w-4" />
          Biomodel Diagram
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {/* Diagram Image */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-3">{error}</div>
            ) : (
              <img
                src={diagramUrl || "/placeholder.svg"}
                alt="Biomodel Diagram"
                className="max-w-full h-auto mx-auto"
              />
            )}
          </div>
        </div>

        {/* Diagram Analysis */}
        <div>
          {isAnalysisLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Analyzing diagram...</span>
            </div>
          ) : analysisError ? (
            <div className="text-red-500 text-center p-3">{analysisError}</div>
          ) : (
            <div className="prose max-w-none">
              <MarkdownRenderer content={diagramAnalysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 