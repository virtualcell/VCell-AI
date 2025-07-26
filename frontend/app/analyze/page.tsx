"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Dna,
  Gauge,
  FlaskRoundIcon as Flask,
  Atom,
  Briefcase,
  Cog,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptTemplate {
  title: string;
  prompt: string;
  icon: React.ReactElement<any>;
  color: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [biomodelId, setBiomodelId] = useState("");
  const [prompt, setPrompt] = useState("");

  const promptTemplates: PromptTemplate[] = [
    {
      title: "Describe Biology of the model",
      prompt: "Describe biology of the model",
      icon: <Dna className="h-4 w-4" />,
      color: "text-green-700",
    },
    {
      title: "Describe Parameters",
      prompt: "Describe Parameters",
      icon: <Gauge className="h-4 w-4" />,
      color: "text-blue-700",
    },
    {
      title: "Describe Species",
      prompt: "Describe Species",
      icon: <Atom className="h-4 w-4" />,
      color: "text-purple-700",
    },
    {
      title: "Describe Reactions",
      prompt: "Describe Reactions",
      icon: <Flask className="h-4 w-4" />,
      color: "text-amber-700",
    },
    {
      title: "What Applications are used?",
      prompt: "What Applications are used?",
      icon: <Briefcase className="h-4 w-4" />,
      color: "text-red-700",
    },
    {
      title: "What solvers are used?",
      prompt: "What solvers are used?",
      icon: <Cog className="h-4 w-4" />,
      color: "text-slate-700",
    },
  ];

  const handlePromptTemplateClick = (prompt: string) => {
    setPrompt(prompt);
  };

  const handleAnalyze = () => {
    if (!biomodelId.trim() || !prompt.trim()) return;
    router.push(`/analyze/${biomodelId}?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Biomodel AI Analysis
          </h1>
          <p className="text-slate-600">
            Unlock insights from your biomodels with the power of AI-driven
            analysis.
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 text-base">
              <Sparkles className="h-4 w-4" />
              Analysis Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <Label
                  htmlFor="biomodelId"
                  className="text-slate-700 font-medium text-sm"
                >
                  Biomodel ID
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="biomodelId"
                    placeholder="Enter biomodel ID (e.g., 12345)"
                    value={biomodelId}
                    onChange={(e) => setBiomodelId(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 h-9 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="prompt"
                  className="text-slate-700 font-medium text-sm"
                >
                  Analysis Question
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="prompt"
                    placeholder="What would you like to analyze?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 h-9 pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-3">
              <Label className="text-slate-700 font-medium text-sm">
                Quick Analysis Templates
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {promptTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptTemplateClick(template.prompt)}
                    className="flex items-center gap-2 h-9 px-3 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors justify-start"
                  >
                    <div className={`${template.color}`}>{template.icon}</div>
                    <span className="text-xs font-medium">
                      {template.title}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <Button
                onClick={handleAnalyze}
                disabled={!biomodelId.trim() || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9"
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze Biomodel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
