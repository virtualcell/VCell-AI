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
  HelpCircle,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ChatBox } from "@/components/ChatBox";
import { SignInOutButton } from "@/components/sign-in-out-button";

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
      faqId: "list-tutorial-models",
    },
    {
      label: "List Calcium models",
      icon: <FileText className="h-3 w-3 mr-2" />,
      value: "List all Calcium models",
      faqId: "list-calcium-models",
    },
    {
      label: "List all models by ModelBrick",
      icon: <User className="h-3 w-3 mr-2" />,
      value: "List all models by ModelBrick",
      faqId: "list-modelbrick-models",
    },
    {
      label: "What solvers are used in tutorial models",
      icon: <Diagram3 className="h-3 w-3 mr-2" />,
      value: "What solvers are used in tutorial models",
      faqId: "tutorial-models-solvers",
    },
    /*     {
      label:
        "What are different types of VCell applications used in Tutorial models",
      icon: <MessageSquare className="h-3 w-3 mr-2" />,
      value:
        "What are different types of VCell applications used in Tutorial models",
    }, */
    {
      label: "What Tutorial models use Spatial Stochastic applications?",
      icon: <Bot className="h-3 w-3 mr-2" />,
      value: "What Tutorial models use Spatial Stochastic applications?",
      faqId: "tutorial-models-spatial-stochastic",
    },
  ];

  const supplementalActions = [
    {
      label: "How to create an account on VCell Software?",
      icon: <User className="h-3 w-3 mr-2" />,
      value: "How to create an account on VCell Software?",
      faqId: "how-to-create-account",
    },
    {
      label: "How to model FrapBindings in VCell Software?",
      icon: <FileText className="h-3 w-3 mr-2" />,
      value: "How to model FrapBindings in VCell Software?",
      faqId: "how-to-frap-bindings",
    },
    {
      label: "How to model Moving Boundaries in VCell Software?",
      icon: <FlaskConical className="h-3 w-3 mr-2" />,
      value: "How to model Moving Boundaries in VCell Software?",
      faqId: "how-to-moving-boundaries",
    },
  ];

  const cardTitle = "VCell AI Assistant";

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-4 w-full">
              {/* Warning Alert - takes most of the space */}
              <Alert className="border-amber-200 bg-amber-50 py-2 flex-1">
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>⚠️ Important:</strong> Responses are AI generated and
                  may contain errors, or hallucinations.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <HelpCircle className="h-4 w-4" />
                How to Use
              </Button>
              <SignInOutButton />
            </div>
          </div>
        </div>

        {/* Chat Interface - takes remaining space */}
        <div className="flex-1 w-full min-h-0">
          <ChatBox
            startMessage={[startMessage]}
            quickActions={quickActions}
            supplementalActions={supplementalActions}
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
