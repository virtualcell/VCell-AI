"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  MessageSquare,
  Bot,
  User,
  Search,
  FileText,
  BarChart3Icon as Diagram3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToolParameters } from "@/components/ToolParameters"
import { OnboardingModal } from "@/components/onboarding-modal"
import { ChatBox } from "@/components/ChatBox"

interface ChatParameters {
  biomodelId: string,
  bmName: string
  category: string
  owner: string
  savedLow: string
  savedHigh: string
  maxRows: number
  orderBy: string
  llmMode: string
}

export default function ChatPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [parameters, setParameters] = useState<ChatParameters>({
    biomodelId: "",
    bmName: "",
    category: "all",
    owner: "",
    savedLow: "",
    savedHigh: "",
    maxRows: 1000,
    orderBy: "date_desc",
    llmMode: "tool_calling",
  })

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("vcell-ai-onboarding-seen")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingClose = () => {
    localStorage.setItem("vcell-ai-onboarding-seen", "true")
    setShowOnboarding(false)
  }

  // Prepare props for ChatBox
  const startMessage = `# Welcome to VCell AI Assistant! 🤖\n\nI'm here to help you with **biomodel analysis** and research support.\nFeel free to ask anything! 🚀`
  const quickActions = [
    {
      label: "List all tutorial models",
      icon: <Search className="h-3 w-3 mr-2" />, value: "List all tutorial models"
    },
    {
      label: "List all Calcium models",
      icon: <FileText className="h-3 w-3 mr-2" />, value: "List all Calcium models"
    },
    {
      label: "List all models by ModelBrick",
      icon: <User className="h-3 w-3 mr-2" />, value: "List all models by ModelBrick"
    },
    {
      label: "What solvers are used in tutorial models",
      icon: <Diagram3 className="h-3 w-3 mr-2" />, value: "What solvers are used in tutorial models"
    },
    {
      label: "What are different types of VCell applications used in Tutorial models",
      icon: <MessageSquare className="h-3 w-3 mr-2" />, value: "What are different types of VCell applications used in Tutorial models"
    },
    {
      label: "What Tutorial models use Spatial Stochastic applications?",
      icon: <Bot className="h-3 w-3 mr-2" />, value: "What Tutorial models use Spatial Stochastic applications?"
    },
  ]
  const cardTitle = "VCell AI Assistant"

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              How to Use
            </Button>
          </div>
          <p className="text-slate-600">
            Interact with our AI assistant for biomodel analysis and research support with integrated tool access.
          </p>
        </div>

        {/* Persistent Warning */}
        <div className="mb-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Important:</strong> Responses are AI generated and may contain errors, or hallucinations. Please use the option "Let AI analyze the JSON" if you suspect hallucination.
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <ChatBox
              startMessage={startMessage}
              quickActions={quickActions}
              cardTitle={cardTitle}
              parameters={parameters}
            />
          </div>

          {/* Tool Parameters Panel */}
          <div className="lg:col-span-1">
            <ToolParameters parameters={parameters} onParametersChange={setParameters} />
          </div>
        </div>
      </div>
      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  )
}