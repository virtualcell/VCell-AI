"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Dna,
  Gauge,
  FlaskConical,
  Atom,
  Briefcase,
  Cog,
  FileText,
  User,
  Lock,
  Globe,
  Calendar,
  Hash,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBox } from "@/components/ChatBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResults {
  title: string;
  description: string;
  aiAnalysis: string;
}

interface BiomodelDetail {
  bmKey: string;
  name: string;
  privacy: number;
  groupUsers: string[];
  savedDate: number;
  annot: string;
  branchID: string;
  modelKey: string;
  ownerName: string;
  ownerKey: string;
}

export default function AnalysisResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";

  // Unwrap the params Promise
  const { id } = React.use(params);

  const [error, setError] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);
  const [diagramAnalysis, setDiagramAnalysis] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [combinedMessages, setCombinedMessages] = useState<string[]>([]);
  const [biomodelData, setBiomodelData] = useState<BiomodelDetail | null>(null);
  const [biomodelLoading, setBiomodelLoading] = useState(true);

  useEffect(() => {
    const fetchBiomodelData = async () => {
      setBiomodelLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/biomodel?bmId=${id}`);
        
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setBiomodelData(json.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch biomodel data:", err);
      } finally {
        setBiomodelLoading(false);
      }
    };

    fetchBiomodelData();
  }, [id]);

  useEffect(() => {
    const fetchDiagramAnalysis = async () => {
      setIsAnalysisLoading(true);
      setAnalysisError("");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/analyse/${id}/diagram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setDiagramAnalysis(data.response || "");
        } else {
          const errorData = await res.json();
          setAnalysisError(errorData.detail || "Failed to analyze diagram.");
        }
      } catch (err) {
        setAnalysisError("Failed to fetch diagram analysis.");
      } finally {
        setIsAnalysisLoading(false);
      }
    };

    const fetchAnalysis = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = new URL(`${apiUrl}/analyse/${id}`);
        if (prompt) {
          url.searchParams.set("user_prompt", prompt);
        }

        const analyseRes = await fetch(url.toString(), {
          method: "POST",
          headers: {
            accept: "application/json",
          },
        });

        if (!analyseRes.ok) throw new Error("Failed to analyze biomodel.");
        const analyseData = await analyseRes.json();

        setResults({
          title: `Analysis for Biomodel ${id}`,
          description: `Results for biomodel ID ${id}.`,
          aiAnalysis: analyseData.response || "No AI analysis available.",
        });
      } catch (err) {
        setError("Failed to analyze biomodel.");
      } finally {
        setIsAnalysisLoading(false);
      }
    };

    // Fetch both analyses
    const fetchBothAnalyses = async () => {
      await Promise.all([fetchDiagramAnalysis(), fetchAnalysis()]);
    };

    fetchBothAnalyses();
  }, [id, prompt]);

  // Create combined messages when analyses are ready
  useEffect(() => {
    if (diagramAnalysis || results?.aiAnalysis) {
      const messageParts: string[] = [];

      if (diagramAnalysis) {
        const diagramMessage = `# Diagram Analysis \n ${diagramAnalysis}`;
        messageParts.push(diagramMessage);
      }

      if (results?.aiAnalysis) {
        const aiMessage = `# Biomodel Analysis \n ${results.aiAnalysis}`;
        messageParts.push(aiMessage);
      }

      const joined_messages = messageParts.join("\n\n");

      setCombinedMessages([joined_messages]);
    }
  }, [diagramAnalysis, results?.aiAnalysis, id]);

  const handleReset = () => {
    router.push("/analyze");
  };

  const handleDownloadVCML = () => {
    const vcellUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${id}/biomodel.vcml`;
    window.open(vcellUrl, "_blank");
  };

  const quickActions = [
    {
      label: "Describe biology of the model",
      value: "Describe biology of the model",
      icon: <Dna className="h-4 w-4" />,
    },
    {
      label: "Describe parameters",
      value: "Describe parameters",
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      label: "Describe species",
      value: "Describe species",
      icon: <Atom className="h-4 w-4" />,
    },
    {
      label: "Describe reactions",
      value: "Describe reactions",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: "What Applications are used?",
      value: "What Applications are used?",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      label: "What solvers are used?",
      value: "What solvers are used?",
      icon: <Cog className="h-4 w-4" />,
    },
    {
      label: "Analyze VCML",
      value: "Analyze VCML",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-slate-600 mb-3">{error}</p>
          <Button onClick={handleReset} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (biomodelLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center">Loading biomodel...</div>;
  }

  const biomodelDiagramUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${id}/diagram`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-6xl">
        <Card className="mb-10 shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                  <FlaskConical className="h-8 w-8 text-blue-500" />
                  {biomodelData?.name || `Biomodel ${id}`}
                </CardTitle>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadVCML}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" /> Download VCML
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded border border-yellow-500 text-yellow-700 bg-white font-semibold shadow-sm transition-colors hover:bg-yellow-50"
                  >
                    <Search className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
              {biomodelData && (
                <div className="flex flex-wrap gap-4 mt-3 text-base text-slate-600">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4 text-blue-400" />{" "}
                    <span className="font-mono text-blue-700">{biomodelData.bmKey}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4 text-blue-400" /> {biomodelData.ownerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-400" />{" "}
                    {new Date(biomodelData.savedDate).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    {biomodelData.privacy === 1 ? (
                      <Lock className="h-4 w-4 text-red-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-500" />
                    )}
                    <span
                      className={
                        biomodelData.privacy === 1 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {biomodelData.privacy === 1 ? "Private" : "Public"}
                    </span>
                  </span>
                  {biomodelData.groupUsers.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-400" />{" "}
                      {biomodelData.groupUsers.join(", ")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            {/* Biomodel Diagram block */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">
                  Biomodel Diagram
                </span>
              </div>
              <img
                src={biomodelDiagramUrl || "/placeholder.svg"}
                alt="Biomodel Diagram"
                className="max-w-full h-auto mx-auto border border-slate-200 rounded shadow"
                onError={() => setError("Failed to load diagram image.")}
                onLoad={() => setError("")}
              />
            </div>

            {/* Chat Box */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-slate-800">
                  AI Analysis Assistant
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded shadow-sm">
                <ChatBox
                  startMessage={combinedMessages}
                  quickActions={quickActions}
                  cardTitle="VCell AI Assistant"
                  promptPrefix={`Analyze the biomodel with the bmId ${id} for the following question: ${prompt}`}
                  isLoading={isAnalysisLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
