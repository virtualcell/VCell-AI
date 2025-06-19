import React, { useEffect, useState } from "react"
import { FileText, Loader2, Download } from "lucide-react"
import XMLViewer from 'react-xml-viewer'
import { MarkdownRenderer } from "./markdown-renderer"
import { Button } from "@/components/ui/button"

interface VCMLSectionProps {
  biomodelId: string
  vcmlAnalysis: string
  isAnalysisLoading: boolean
}

export const VCMLSection: React.FC<VCMLSectionProps> = ({ biomodelId, vcmlAnalysis, isAnalysisLoading }) => {
  const [vcml, setVcml] = useState<string>("")
  const [fullVcml, setFullVcml] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVcml = async () => {
      setIsLoading(true)
      setError("")
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/biomodel.vcml`)
        if (!res.ok) {
          setError("Failed to fetch VCML from backend.")
          setVcml("")
          setFullVcml("")
        } else {
          let text = await res.text()
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.slice(1, -1)
          }
          setFullVcml(text)
          
          // Truncate to 50 lines
          const lines = text.split('\n')
          const truncatedText = lines.slice(0, 10).join('\n')
          if (lines.length > 10) {
            setVcml(truncatedText)
          } else {
            setVcml(text)
          }
        }
      } catch (err) {
        setError("Failed to fetch VCML from backend.")
        setVcml("")
        setFullVcml("")
      } finally {
        setIsLoading(false)
      }
    }

    if (biomodelId) {
      fetchVcml()
    }
  }, [biomodelId])

  const handleDownload = () => {
    if (fullVcml) {
      const blob = new Blob([fullVcml], { type: 'text/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `biomodel-${biomodelId}.vcml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <>
      {/* VCML File Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            VCML File
          </h3>
          {fullVcml && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Full File
            </Button>
          )}
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-[400px] overflow-hidden relative">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                <XMLViewer xml={vcml} />
              </pre>
              {/* Blurry overlay for truncated content */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-6 left-4 right-4 text-center pointer-events-none">
                <p className="text-sm text-slate-600 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md inline-block shadow-sm">
                  This is just the truncated version, click download to explore the whole file
                </p>
              </div>
            </div>
          )}
        </div>
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
          {isAnalysisLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Analyzing VCML...</span>
            </div>
          ) : (
            <div className="prose max-w-none">
              <MarkdownRenderer content={vcmlAnalysis} />
            </div>
          )}
        </div>
      </div>
    </>
  )
} 