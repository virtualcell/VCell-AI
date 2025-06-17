import React from "react"
import { FileText } from "lucide-react"
import XMLViewer from 'react-xml-viewer'

interface VCMLSectionProps {
  vcml: string
  vcmlAnalysis: string
}

export const VCMLSection: React.FC<VCMLSectionProps> = ({ vcml, vcmlAnalysis }) => {
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
          <XMLViewer xml={vcml} />
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
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{vcmlAnalysis}</div>
          </div>
        </div>
      </div>
    </>
  )
} 