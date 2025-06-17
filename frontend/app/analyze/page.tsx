"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MessageSquare,
  Dna,
  Gauge,
  FlaskRoundIcon as Flask,
  Atom,
  Briefcase,
  Cog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PromptTemplate {
  title: string
  prompt: string
  icon: React.ReactElement<any>
  color: string
}

export default function AnalyzePage() {
  const router = useRouter()
  const [biomodelId, setBiomodelId] = useState("")
  const [prompt, setPrompt] = useState("")

  const promptTemplates: PromptTemplate[] = [
    {
      title: "Describe biology of the model",
      prompt: "Describe biology of the model",
      icon: <Dna className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      title: "Describe parameters",
      prompt: "Describe parameters",
      icon: <Gauge className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      title: "Describe species",
      prompt: "Describe species",
      icon: <Atom className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      title: "Describe reactions",
      prompt: "Describe reactions",
      icon: <Flask className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      title: "What Applications are used?",
      prompt: "What Applications are used?",
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      title: "What solvers are used?",
      prompt: "What solvers are used?",
      icon: <Cog className="h-4 w-4" />,
      color: "bg-slate-100 text-slate-800 border-slate-200",
    },
  ]

  const handlePromptTemplateClick = (prompt: string) => {
    setPrompt(prompt)
  }

  const handleAnalyze = () => {
    if (!biomodelId.trim() || !prompt.trim()) return
    router.push(`/analyze/${biomodelId}?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center text-slate-900">
      <div className="container mx-auto p-8 max-w-5xl">
        <div className="space-y-10 flex flex-col items-center">
          {/* Enhanced Header */}
          <div className="text-center mb-10">
            <h1 className="text-7xl font-extrabold text-blue-600 mb-3">
              Biomodel AI Analysis
            </h1>
            <p className="text-slate-500 text-lg">
              Unlock insights from your biomodels with the power of AI.
            </p>
          </div>

          {/* Enhanced Two large search bars side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-center">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <Input
                placeholder="Enter BioModel ID (e.g., 12345)"
                value={biomodelId}
                onChange={(e) => setBiomodelId(e.target.value)}
                className="text-xl h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl shadow-sm transition-all duration-300 ease-in-out text-slate-900 placeholder-slate-400"
              />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <Input
                placeholder="What would you like to analyze?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-xl h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl shadow-sm transition-all duration-300 ease-in-out text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Enhanced Example Prompts */}
          <div className="w-full max-w-4xl pt-4">
            <p className="text-center text-slate-500 mb-5 text-sm">Or try one of these example prompts:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {promptTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptTemplateClick(template.prompt)}
                  className={`group flex items-center justify-start text-left p-3 rounded-lg border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-500 transition-all duration-200 ease-in-out shadow-xs text-slate-700 hover:text-blue-600`}
                >
                  <div className={`mr-3 p-1.5 rounded-md ${template.color.replace("bg-", "bg-opacity-10 ").replace("text-", "text-").replace("border-", "border-opacity-20 ")}`}>
                    {React.cloneElement(template.icon, { className: "h-5 w-5" })}
                  </div>
                  <span className="text-xs font-medium group-hover:font-semibold">{template.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleAnalyze}
              disabled={!biomodelId.trim() || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-xl"
            >
              <Search className="h-6 w-6 mr-2" />
              Analyze Biomodel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}