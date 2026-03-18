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
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ChatBox } from "@/components/ChatBox";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";

export default function ChatPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toggleSidebar, isMobile } = useSidebar();

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
      label: "List Calcium models",
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
    },
  ];

  const supplementalActions = [
    {
      label: "How to create an account on VCell Software?",
      icon: <User className="h-3 w-3 mr-2" />,
      value: "How to create an account on VCell Software?",
    },
    {
      label: "How to model FrapBindings in VCell Software?",
      icon: <FileText className="h-3 w-3 mr-2" />,
      value: "How to model FragBindings in VCell Software?",
    },
    {
      label: "How to model Moving Boundaries in VCell Software?",
      icon: <FlaskConical className="h-3 w-3 mr-2" />,
      value: "How to model Moving Boundaries in VCell Software?",
    },
  ];

  const cardTitle = "VCell AI Assistant";

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Image
              src="/VCellLogo.png"
              alt="VCell Logo"
              width={48}
              height={48}
              className="rounded w-12 h-12 object-contain"
            />
            <span className="text-lg font-semibold text-slate-900">
              VCell AI Chat
            </span>
          </div>
        </header>
      )}
      
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 sm:gap-4 w-full">
              {/* Warning Alert - takes most of the space */}
              <Alert className="border-amber-200 bg-amber-50 py-2 flex-1">
                <AlertDescription className="text-amber-800 text-xs sm:text-sm">
                  <strong>⚠️ Important:</strong> Responses are AI generated and may contain errors, or hallucinations.
                </AlertDescription>
              </Alert>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0 px-2 sm:px-3"
              >
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">How to Use</span>
                <span className="sm:hidden text-xs">Help</span>
              </Button>
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
