"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Code, User, Hash } from "lucide-react"

interface Application {
  key: string
  branchId: string
  name: string
  ownerName: string
  ownerKey: string
  mathKey: string
  bngl_url: string
  sbml_url: string
}

interface ApplicationsResponse {
  biomodel_id: string
  applications: Application[]
  total_applications: number
}

export default function SBMLPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [applicationsData, setApplicationsData] = useState<ApplicationsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRetrieve = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/applications/files`)
      if (!res.ok) {
        setError(`Failed to fetch applications data.`)
        setApplicationsData(null)
      } else {
        const data = await res.json()
        setApplicationsData(data)
      }
    } catch (err) {
      setError(`Failed to fetch applications data.`)
      setApplicationsData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Code className="h-8 w-8 text-blue-600" />
            Biomodel Applications
          </h1>
          <p className="text-slate-600">
            Retrieve and download SBML and BNGL files for all applications within a biomodel.
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              Applications Retrieval
            </CardTitle>
            <CardDescription>
              Enter a biomodel ID to fetch all its applications with downloadable SBML and BNGL files
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="biomodelId" className="text-slate-700 font-medium">
                  Biomodel ID
                </Label>
                <Input
                  id="biomodelId"
                  placeholder="Enter biomodel ID (e.g., 200301029)"
                  value={biomodelId}
                  onChange={(e) => setBiomodelId(e.target.value)}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleRetrieve}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? "Retrieving..." : "Retrieve Applications"}
              </Button>
            </div>
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Applications Display */}
        {applicationsData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-green-50 border-b border-slate-200">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Biomodel Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-600">
                      Biomodel ID
                    </Badge>
                    <span className="font-mono text-slate-900">{applicationsData.biomodel_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-600">
                      Total Applications
                    </Badge>
                    <span className="font-semibold text-slate-900">{applicationsData.total_applications}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-600">
                      Status
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applicationsData.applications.map((app, index) => (
                <Card key={app.key} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-slate-900 text-lg mb-2">
                          {app.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{app.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Hash className="h-4 w-4" />
                            <span>Key: {app.key}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Application Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Branch ID:</span>
                          <div className="font-mono text-slate-900">{app.branchId}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Math Key:</span>
                          <div className="font-mono text-slate-900">{app.mathKey}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Owner Key:</span>
                          <div className="font-mono text-slate-900">{app.ownerKey}</div>
                        </div>
                      </div>

                      {/* Download Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleDownload(app.sbml_url, `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}_${app.key}.sbml`)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download SBML
                        </Button>
                        <Button
                          onClick={() => handleDownload(app.bngl_url, `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}_${app.key}.bngl`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download BNGL
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Applications Message */}
            {applicationsData.applications.length === 0 && (
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applications Found</h3>
                  <p className="text-slate-600">
                    This biomodel doesn't have any applications or the applications data couldn't be retrieved.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
