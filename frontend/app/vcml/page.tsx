"use client"

import { useState } from "react"
import { FileText, Download, Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import XMLViewer from 'react-xml-viewer'

export default function VCMLPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [vcmlContent, setVcmlContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRetrieveVCML = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/biomodel.vcml`)
      if (!res.ok) {
        setError("Failed to fetch VCML from backend.")
        setVcmlContent("")
      } else {
        let text = await res.text()
        // Remove starting and ending quotes if present
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1)
        }
        setVcmlContent(text)
      }
    } catch (err) {
      setError("Failed to fetch VCML from backend.")
      setVcmlContent("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!vcmlContent) return

    const blob = new Blob([vcmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `biomodel_${biomodelId}.vcml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(vcmlContent)
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">VCML File Retrieval</h1>
          <p className="text-slate-600">Retrieve and download Virtual Cell Markup Language files for biomodels.</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              Biomodel VCML Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its VCML file content</CardDescription>
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
                onClick={handleRetrieveVCML}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Retrieving..." : "Retrieve VCML"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* VCML Content Display */}
        {vcmlContent && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">VCML File Content</CardTitle>
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
                <XMLViewer xml={vcmlContent}/>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
