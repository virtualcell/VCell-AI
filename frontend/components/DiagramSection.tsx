import React from "react"
import { BarChart3Icon as Diagram3, Search } from "lucide-react"

interface DiagramSectionProps {
  diagramUrl: string
  diagramAnalysis: string
}

export const DiagramSection: React.FC<DiagramSectionProps> = ({ diagramUrl, diagramAnalysis }) => {
  return (
    <>
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
                src={diagramUrl || "/placeholder.svg"}
                alt="Biomodel Diagram"
                className="max-w-full h-auto mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagram Analysis Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Diagram Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{diagramAnalysis}</div>
          </div>
        </div>
      </div>
    </>
  )
} 