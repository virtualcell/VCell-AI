"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Lock, Globe, Calendar, Hash, Layers, FlaskConical, Users, FileText } from "lucide-react"

interface Simulation {
  key: string
  branchId: string
  name: string
  ownerName: string
  ownerKey: string
  mathKey: string
  solverName: string
  scanCount: number
  bioModelLink: {
    bioModelKey: string
    bioModelBranchId: string
    bioModelName: string
    simContextKey: string
    simContextBranchId: string
    simContextName: string
  }
  overrides: Array<{
    name: string
    type: string
    values: string[]
    cardinality: number
  }>
}

interface Application {
  key: string
  branchId: string
  name: string
  ownerName: string
  ownerKey: string
  mathKey: string
}

interface BiomodelDetail {
  bmKey: string
  name: string
  privacy: number
  groupUsers: string[]
  savedDate: number
  annot: string
  branchID: string
  modelKey: string
  ownerName: string
  ownerKey: string
  simulations: Simulation[]
  applications: Application[]
}

export default function BiomodelDetailPage() {
  const params = useParams<{ bmid: string }>()
  const bmid = params?.bmid
  const [data, setData] = useState<BiomodelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!bmid) return
    setLoading(true)
    setError("")
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/biomodel?bmId=${bmid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch biomodel details")
        return res.json()
      })
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data[0])
        } else {
          setError("Biomodel not found.")
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [bmid])

  if (loading) return <div className="p-8 text-center">Loading biomodel...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!data) return null

  const biomodelDiagramUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data.bmKey}/diagram`

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-6xl">
        <Card className="mb-10 shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                  <FlaskConical className="h-8 w-8 text-blue-500" />
                  {data.name}
                </CardTitle>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const vcellUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data?.bmKey}/biomodel.vcml`
                      window.open(vcellUrl, '_blank')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" /> Download VCML
                  </button>
                  <button
                    onClick={() => {
                      window.open(`/analyze/${data?.bmKey}?prompt=Describe%20model`, '_blank')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border border-yellow-500 text-yellow-700 bg-white font-semibold shadow-sm transition-colors hover:bg-yellow-50"
                  >
                    <FlaskConical className="h-4 w-4" /> AI Analysis
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-base text-slate-600">
                <span className="flex items-center gap-1"><Hash className="h-4 w-4 text-blue-400" /> <span className="font-mono text-blue-700">{data.bmKey}</span></span>
                <span className="flex items-center gap-1"><User className="h-4 w-4 text-blue-400" /> {data.ownerName}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-blue-400" /> {new Date(data.savedDate).toLocaleString()}</span>
                <span className="flex items-center gap-1">
                  {data.privacy === 1 ? <Lock className="h-4 w-4 text-red-400" /> : <Globe className="h-4 w-4 text-green-500" />}
                  <span className={data.privacy === 1 ? "text-red-600" : "text-green-1200"}>{data.privacy === 1 ? "Private" : "Public"}</span>
                </span>
                {data.groupUsers.length > 0 && (
                  <span className="flex items-center gap-1"><Users className="h-4 w-4 text-blue-400" /> {data.groupUsers.join(", ")}</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            {/* Biomodel Diagram block */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">Biomodel Diagram</span>
              </div>
              <img
                src={biomodelDiagramUrl || "/placeholder.svg"}
                alt="Biomodel Diagram"
                className="max-w-full h-auto mx-auto border border-slate-200 rounded shadow"
                onError={() => setError("Failed to load diagram image.")}
                onLoad={() => setError("")}
              />
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">Description</span>
              </div>
              <div className="whitespace-pre-line text-slate-700 bg-blue-50 rounded p-4 border border-blue-100 shadow-sm">
                {data.annot && data.annot.trim() !== "" ? data.annot : "No description is available for this biomodel"}
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">Applications</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                {data.applications?.map((app) => (
                  <li key={app.key} className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col gap-1 shadow-sm">
                    <span className="font-medium text-blue-900 flex items-center gap-2"><Hash className="h-4 w-4 text-blue-300" />{app.name}</span>
                    <span className="text-xs text-slate-500">App Key: <span className="font-mono text-blue-700">{app.key}</span></span>
                    <span className="text-xs text-slate-500">MathKey: <span className="font-mono text-blue-700">{app.mathKey}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">Simulations</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                {data.simulations?.map((sim) => (
                  <li key={sim.key} className="bg-slate-50 border border-slate-200 rounded p-3 shadow-sm">
                    <div className="font-medium text-blue-900 flex items-center gap-2 mb-1"><Hash className="h-4 w-4 text-blue-300" />{sim.name}</div>
                    <div className="text-xs text-slate-500 mb-1 flex flex-wrap gap-2">
                      <span>Solver: <span className="font-mono text-blue-700">{sim.solverName}</span></span>
                      <span>Scan Count: <span className="font-mono text-blue-700">{sim.scanCount}</span></span>
                      <span>Sim Context: <span className="font-mono text-blue-700">{sim.bioModelLink.simContextName}</span></span>
                    </div>
                    {sim.overrides && sim.overrides.length > 0 && (
                      <div className="text-xs text-slate-600 mt-2">
                        <strong>Overrides:</strong>
                        <ul className="list-disc ml-4">
                          {sim.overrides.map((ov, i) => (
                            <li key={i}>
                              {ov.name} ({ov.type}): <span className="font-mono text-blue-700">{ov.values.join(", ")}</span> (Cardinality: {ov.cardinality})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
