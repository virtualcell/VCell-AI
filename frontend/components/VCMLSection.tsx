import React, { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import XMLViewer from 'react-xml-viewer'
import { MarkdownRenderer } from "./markdown-renderer"

interface VCMLSectionProps {
  biomodelId: string
  vcmlAnalysis: string
}

export const VCMLSection: React.FC<VCMLSectionProps> = ({ biomodelId, vcmlAnalysis }) => {
  const [vcml, setVcml] = useState<string>("")
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
        } else {
          let text = await res.text()
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.slice(1, -1)
          }
          setVcml(text)
        }
      } catch (err) {
        setError("Failed to fetch VCML from backend.")
        setVcml("")
      } finally {
        setIsLoading(false)
      }
    }

    if (biomodelId) {
      fetchVcml()
    }
  }, [biomodelId])

  return (
    <>
      {/* VCML File Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            VCML File
          </h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <XMLViewer xml={vcml} />
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
          <div className="prose max-w-none">
            <MarkdownRenderer content={vcmlAnalysis} />
          </div>
        </div>
      </div>
    </>
  )
} 