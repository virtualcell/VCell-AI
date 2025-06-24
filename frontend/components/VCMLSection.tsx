import React, { useEffect, useState } from "react"
import { FileText, Loader2, Download } from "lucide-react"
import XMLViewer from 'react-xml-viewer'
import { MarkdownRenderer } from "./markdown-renderer"
import { Button } from "@/components/ui/button"

interface VCMLSectionProps {
  biomodelId: string
}

export const VCMLSection: React.FC<VCMLSectionProps> = ({ biomodelId }) => {
  const [vcmlAnalysis, setVcmlAnalysis] = useState<string>("")
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState("")

  useEffect(() => {
    const fetchVcmlAnalysis = async () => {
      setIsAnalysisLoading(true)
      setAnalysisError("")
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/analyse/${biomodelId}/vcml`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (res.ok) {
          const data = await res.json()
          setVcmlAnalysis(data.response || "")
        } else {
          const errorData = await res.json()
          setAnalysisError(errorData.detail || "Failed to analyze VCML.")
        }
      } catch (err) {
        setAnalysisError("Failed to fetch VCML analysis.")
      } finally {
        setIsAnalysisLoading(false)
      }
    }

    if (biomodelId) {
      fetchVcmlAnalysis()
    }
  }, [biomodelId])

  const handleDownload = () => {
    const vcellUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${biomodelId}/biomodel.vcml`
    window.open(vcellUrl, '_blank')
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          VCML Analysis
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Full File
        </Button>
      </div>
      <div className="p-4">
        {isAnalysisLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Analyzing VCML...</span>
          </div>
        ) : analysisError ? (
          <div className="text-red-500 text-center p-3">{analysisError}</div>
        ) : (
          <div className="prose max-w-none">
            <MarkdownRenderer content={vcmlAnalysis} />
          </div>
        )}
      </div>
    </div>
  )
} 