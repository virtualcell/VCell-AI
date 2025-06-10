"use client"

import { useState } from "react"
import { Code, Download, Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import XMLViewer from 'react-xml-viewer'

export default function SBMLPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [sbmlContent, setSbmlContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRetrieveSBML = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/biomodel.sbml`)
      if (!res.ok) {
        setError("Failed to fetch SBML from backend.")
        setSbmlContent("")
      } else {
        let text = await res.text()
        // Remove starting and ending quotes if present
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1)
        }
        setSbmlContent(text)
      }
    } catch (err) {
      setError("Failed to fetch SBML from backend.")
      setSbmlContent("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!sbmlContent) return

    const blob = new Blob([sbmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `biomodel_${biomodelId}.sbml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sbmlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SBML File Retrieval</h1>
          <p className="text-slate-600">Retrieve and download Systems Biology Markup Language files for biomodels.</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Code className="h-5 w-5" />
              Biomodel SBML Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its SBML file content</CardDescription>
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
                onClick={handleRetrieveSBML}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Retrieving..." : "Retrieve SBML"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* SBML Content Display */}
        {sbmlContent && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">SBML File Content</CardTitle>
                  <CardDescription>Biomodel ID: {biomodelId}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-8">
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white h-8">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <XMLViewer xml={sbmlContent}/>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
