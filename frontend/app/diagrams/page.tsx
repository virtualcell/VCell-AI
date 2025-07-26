"use client";

import { useState } from "react";
import {
  BarChart3Icon as Diagram3,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DiagramInfo {
  url: string;
  title: string;
  format: string;
}

export default function DiagramsPage() {
  const [biomodelId, setBiomodelId] = useState("");
  const [diagramInfo, setDiagramInfo] = useState<DiagramInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRetrieveDiagram = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setDiagramInfo(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/biomodel/${biomodelId}/diagram/image`);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.startsWith("image")) {
        // If image, create object URL
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        setDiagramInfo({
          url: imageUrl,
          title: `Diagram for Biomodel ${biomodelId}`,
          format: contentType.split("/")[1].toUpperCase(),
        });
      } else if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setError(data.detail || "Diagram not found.");
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError("Failed to fetch diagram.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDiagramInNewTab = () => {
    if (diagramInfo?.url) {
      window.open(diagramInfo.url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Diagram Visualization
          </h1>
          <p className="text-slate-600">
            Retrieve and visualize biomodel diagrams and network
            representations.
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Diagram3 className="h-5 w-5" />
              Biomodel Diagram Retrieval
            </CardTitle>
            <CardDescription>
              Enter a biomodel ID to retrieve its diagram visualization
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="biomodelId"
                  className="text-slate-700 font-medium"
                >
                  Biomodel ID
                </Label>
                <Input
                  id="biomodelId"
                  placeholder="Enter biomodel ID (e.g., 257427200)"
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
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Diagram Information & Preview Card (Fused) */}
        {diagramInfo && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">
                    Diagram Information
                  </CardTitle>
                  <CardDescription>Biomodel ID: {biomodelId}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {diagramInfo.format}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {diagramInfo.title}
                  </h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  {/* Show the diagram image */}
                  <img
                    src={diagramInfo.url}
                    alt={diagramInfo.title}
                    className="max-w-full max-h-96 rounded border border-slate-200 bg-white shadow"
                  />
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={openDiagramInNewTab}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Diagram
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = diagramInfo.url;
                        link.download =
                          diagramInfo.title.replace(/\s+/g, "_") +
                          "." +
                          diagramInfo.format.toLowerCase();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="border-slate-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Download Diagram
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
