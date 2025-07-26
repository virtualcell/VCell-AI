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
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBox } from "@/components/ChatBox";

interface AnalysisResults {
  title: string;
  description: string;
  aiAnalysis: string;
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
        const diagramMessage = `# Diagram Analysis \n ![Diagram](https://vcell.cam.uchc.edu/api/v0/biomodel/${id}/diagram)\n\n${diagramAnalysis}`;
        messageParts.push(diagramMessage);
      }

      if (results?.aiAnalysis) {
        const aiMessage = `# Biomodel Analysis \n\n${results.aiAnalysis}`;
        messageParts.push(aiMessage);
      }

      setCombinedMessages(messageParts);
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-4">
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

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="container mx-auto p-3 max-w-5xl flex-1 flex flex-col min-h-0">
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          {/* Results Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-0.5">
                {results?.title || `Analysis for Biomodel ${id}`}
              </h2>
              <p className="text-slate-600 text-sm">
                {results?.description || `Results for biomodel ID ${id}.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadVCML}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download VCML
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Chat Box */}
          <div className="flex-1 min-h-0">
            <ChatBox
              startMessage={combinedMessages}
              quickActions={quickActions}
              cardTitle="VCell AI Assistant"
              promptPrefix={`Analyze the biomodel with the bmId ${id} for the following question: ${prompt}`}
              isLoading={isAnalysisLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
