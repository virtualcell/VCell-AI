"use client"

import { useState } from "react"
import { BarChart3Icon as Diagram3, Search, ExternalLink, Copy, Check, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface DiagramInfo {
  url: string
  title: string
  description: string
  format: string
  dimensions: string
}

export default function DiagramsPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [diagramInfo, setDiagramInfo] = useState<DiagramInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRetrieveDiagram = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }

    setIsLoading(true)
    setError("")

    // Mock diagram info for demonstration
    const mockDiagramInfo: DiagramInfo = {
      url: `https://vcell.org/webstart/diagram?bmId=${biomodelId}&format=png&width=800&height=600`,
      title: "Cardiac Myocyte Calcium Dynamics - Network Diagram",
      description:
        "Visual representation of the calcium handling network in cardiac myocytes, showing compartments, species, and reaction pathways.",
      format: "PNG",
      dimensions: "800x600 pixels",
    }

    // Simulate API delay
    setTimeout(() => {
      setDiagramInfo(mockDiagramInfo)
      setIsLoading(false)
    }, 1000)
  }

  const copyUrlToClipboard = async () => {
    if (!diagramInfo?.url) return

    try {
      await navigator.clipboard.writeText(diagramInfo.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openDiagramInNewTab = () => {
    if (diagramInfo?.url) {
      window.open(diagramInfo.url, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Diagram Visualization</h1>
          <p className="text-slate-600">Retrieve and visualize biomodel diagrams and network representations.</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Diagram3 className="h-5 w-5" />
              Biomodel Diagram Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its diagram visualization</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="biomodelId" className="text-slate-700 font-medium">
                  Biomodel ID
                </Label>
                <Input
                  id="biomodelId"
                  placeholder="Enter biomodel ID (e.g., 123456789)"
                  value={biomodelId}
                  onChange={(e) => setBiomodelId(e.target.value)}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleRetrieveDiagram}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Retrieving..." : "Get Diagram"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Diagram Information Display */}
        {diagramInfo && (
          <div className="space-y-6">
            {/* Diagram Info Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Diagram Information</CardTitle>
                    <CardDescription>Biomodel ID: {biomodelId}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {diagramInfo.format}
                    </Badge>
                    <Badge variant="outline">{diagramInfo.dimensions}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{diagramInfo.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{diagramInfo.description}</p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Diagram URL:</Label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border">
                      <code className="flex-1 text-sm text-slate-800 break-all font-mono">{diagramInfo.url}</code>
                      <Button size="sm" variant="outline" onClick={copyUrlToClipboard} className="h-8 shrink-0">
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={openDiagramInNewTab} className="bg-green-600 hover:bg-green-700 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Diagram
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(diagramInfo.url, "_blank")}
                      className="border-slate-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View in New Tab
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagram Preview Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-slate-900">Diagram Preview</CardTitle>
                <CardDescription>Visual representation of the biomodel network</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <Diagram3 className="h-16 w-16 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-slate-600 mb-2">Click the button below to view the diagram in a new window</p>
                      <p className="text-sm text-slate-500">
                        The diagram will open in your browser with full interactive capabilities
                      </p>
                    </div>
                    <Button onClick={openDiagramInNewTab} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Diagram
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-slate-900">Technical Details</CardTitle>
                <CardDescription>Additional information about the diagram</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-700 font-medium">Format</Label>
                      <p className="text-slate-600">{diagramInfo.format} Image</p>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">Dimensions</Label>
                      <p className="text-slate-600">{diagramInfo.dimensions}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-700 font-medium">Access Method</Label>
                      <p className="text-slate-600">Direct URL Link</p>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">Availability</Label>
                      <p className="text-slate-600">Real-time Generation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
