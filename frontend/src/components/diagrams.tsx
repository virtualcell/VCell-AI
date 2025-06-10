import { useState } from "react"
import { BarChart3Icon as Diagram3, Search, ExternalLink, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DiagramsPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const vcellUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${biomodelId}/diagram`;

const handleRetrieveDiagram = async () => {
  if (!biomodelId.trim()) {
    setError("Please enter a biomodel ID");
    return;
  }

  setIsLoading(true);
  setError("");
  setImageUrl(null);

  const backendUrl = `${import.meta.env.VITE_API_URL}/biomodel/${biomodelId}/diagram/image`;

  try {
    const res = await fetch(backendUrl);
    if (!res.ok) {
      if (res.status === 404) {
        setError("Biomodel not found. Please check the ID and try again.");
      } else {
        setError("Failed to fetch diagram. Please try again later.");
      }
      return;
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    setImageUrl(blobUrl);
  } catch (e) {
    setError("Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  const copyUrlToClipboard = async () => {
    if (!imageUrl) return
    try {
      await navigator.clipboard.writeText(vcellUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError("Failed to copy URL.")
    }
  }

  const openDiagramInNewTab = () => {
    if (biomodelId && imageUrl) {
      window.open(vcellUrl, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Diagram Visualization</h1>
          <p className="text-slate-600">Retrieve and preview biomodel diagrams from VCell.</p>
        </div>
        <Card className="mb-8 shadow-md border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Diagram3 className="h-5 w-5" />
              Biomodel Diagram Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its diagram</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="biomodelId" className="text-slate-700 font-medium">
                  Biomodel ID
                </Label>
                <Input
                  id="biomodelId"
                  placeholder="Enter biomodel ID (e.g., 12)"
                  value={biomodelId}
                  onChange={(e) => setBiomodelId(e.target.value)}
                  className="border-slate-300 focus:border-blue-500"
                  onKeyDown={e => { if (e.key === 'Enter') handleRetrieveDiagram() }}
                />
              </div>
              <Button
                onClick={handleRetrieveDiagram}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
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
        {imageUrl && !error && (
          <Card className="shadow-md border-slate-200 mb-8">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Diagram3 className="h-5 w-5" />
                Diagram Preview
              </CardTitle>
              <CardDescription>Biomodel ID: <span className="font-mono">{biomodelId}</span></CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <img
                  src={imageUrl}
                  alt={`Diagram for biomodel ${biomodelId}`}
                  className="rounded-lg border shadow-md max-w-full max-h-[500px] bg-white"
                  style={{ objectFit: 'contain' }}
                />
                <div className="flex gap-3 mt-4">
                  <Button onClick={openDiagramInNewTab} className="bg-green-600 hover:bg-green-700 text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button variant="outline" onClick={copyUrlToClipboard} className="border-slate-300">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Image URL"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
