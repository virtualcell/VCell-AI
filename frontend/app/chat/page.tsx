"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Bot,
  User,
  Search,
  FileText,
  BarChart3Icon as Diagram3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ChatBox } from "@/components/ChatBox";

export default function ChatPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("vcell-ai-onboarding-seen");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingClose = () => {
    localStorage.setItem("vcell-ai-onboarding-seen", "true");
    setShowOnboarding(false);
  };

  // Prepare props for ChatBox
  const startMessage = `I'm here to help you with **biomodel analysis**, **vcell software** and **research support**  .\nFeel free to ask anything! 🚀`;
  const quickActions = [
    {
      label: "List all tutorial models",
      icon: <Search className="h-3 w-3 mr-2" />,
      value: "List all tutorial models",
    },
    {
      label: "List all Calcium models",
      icon: <FileText className="h-3 w-3 mr-2" />,
      value: "List all Calcium models",
    },
    {
      label: "List all models by ModelBrick",
      icon: <User className="h-3 w-3 mr-2" />,
      value: "List all models by ModelBrick",
    },
    {
      label: "What solvers are used in tutorial models",
      icon: <Diagram3 className="h-3 w-3 mr-2" />,
      value: "What solvers are used in tutorial models",
    },
    {
      label:
        "What are different types of VCell applications used in Tutorial models",
      icon: <MessageSquare className="h-3 w-3 mr-2" />,
      value:
        "What are different types of VCell applications used in Tutorial models",
    },
    {
      label: "What Tutorial models use Spatial Stochastic applications?",
      icon: <Bot className="h-3 w-3 mr-2" />,
      value: "What Tutorial models use Spatial Stochastic applications?",
    },
  ];
  const cardTitle = "VCell AI Assistant";

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
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
        </div>

        {/* Persistent Warning */}
        <div className="mb-3 flex-shrink-0">
          <Alert className="border-amber-200 bg-amber-50 py-2">
            <AlertDescription className="text-amber-800 text-sm">
              <strong>⚠️ Important:</strong> Responses are AI generated and may contain errors, or hallucinations.
            </AlertDescription>
          </Alert>
        </div>

        {/* Chat Interface - takes remaining space */}
        <div className="flex-1 w-full min-h-0">
          <ChatBox
            startMessage={[startMessage]}
            quickActions={quickActions}
            cardTitle={cardTitle}
          />
        </div>
      </div>
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </div>
  );
}
