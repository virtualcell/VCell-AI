"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  Search,
  FileText,
  Code,
  BarChart3Icon as Diagram3,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Natural Language Queries",
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4">
              <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Ask questions in plain English!
              </h3>
              <p className="text-slate-600">
                The AI Assistant understands natural language. Just type your
                questions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-medium">
              Try asking questions like:
            </Label>
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <MessageSquare className="h-3 w-3" />
                  Example Query
                </div>
                <div className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded">
                  "Show me all Rule-based tutorial models"
                </div>
              </div>
            </div>

            {/* Mock Input Area */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4">
              <Label className="text-sm text-slate-600 mb-2 block">
                Try it yourself:
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about biomodels, request files, or generate diagrams..."
                  className="flex-1 border-slate-300"
                  disabled
                />
                <Button disabled className="bg-blue-600 text-white px-4">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
     {
      title: "Available Tools",
      subtitle: "Tools the LLM uses to provide factual answers",
      icon: <Search className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
              <Search className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                LLM Analysis Tools
              </h3>
              <p className="text-slate-600 text-sm">
                The LLM uses these tools and a curated knowledge base to provide accurate, factual answers to your questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Biomodel Search
                    </h4>
                    <p className="text-xs text-slate-600">Database querying</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  The LLM searches the database with precise filters to find relevant models and information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">VCML Files</h4>
                    <p className="text-xs text-slate-600">
                      Model definitions
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  The LLM accesses complete model definitions with compartments, species, and kinetics for detailed analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Knowledge Base</h4>
                    <p className="text-xs text-slate-600">Curated documentation</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  The LLM uses a comprehensive set of documents curated by the VCell team to answer questions factually and accurately.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Diagram3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Diagrams</h4>
                    <p className="text-xs text-slate-600">Visual networks</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  The LLM can generate real-time network diagrams showing topology and interactions for visual understanding.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Understand the Response",
      subtitle: "How to interpret and explore AI responses",
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium text-sm">
              Example Response with Interactive Elements:
            </Label>
            
            <div className="bg-white border-2 border-slate-300 rounded-lg p-4 font-mono text-sm">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900">DupontCellCalcium</div>
                <div className="text-slate-700">
                  ID: 114597194 -- <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg animate-pulse cursor-pointer hover:bg-blue-600 transition-colors">Database</span>
                </div>
                <div className="text-slate-700">Owner: moutoutan</div>
                <div className="text-slate-700">Description: A model simulating calcium dynamics in a cellular context.</div>
                <div className="text-slate-700">Applications: Application0</div>
                <div className="text-slate-700">Simulations: Multiple simulations with varying configurations.</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">💡</span>
                </div>
                <div className="text-xs text-blue-800">
                  <strong>Interactive Database Link:</strong> The blue, shining "Database" button is a hyperlink that takes you to a dedicated page where you can view all database details about that specific model. On that page, you can also have an LLM discussion where the AI is well-instructed about that particular model's context and specifications.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Important Disclaimers",
      subtitle: "Understanding AI limitations",
      icon: <AlertTriangle className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4">
              <AlertTriangle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                AI Response Limitations
              </h3>
              <p className="text-slate-600">
                Understanding these limitations ensures you use the AI Assistant
                effectively and safely.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">🤖</span>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    AI Hallucinations
                  </h4>
                  <p className="text-sm text-blue-800">
                    AI may generate plausible-sounding but incorrect information
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">⚠️</span>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Server Errors
                  </h4>
                  <p className="text-sm text-blue-800">
                    Technical issues may affect response accuracy or
                    availability
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Private Models
                  </h4>
                  <p className="text-sm text-blue-800">
                    Feature under development to access private models securely
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[70vh] p-2 sm:p-3 overflow-y-auto text-xs sm:text-sm">
        <DialogHeader className="border-b border-slate-200 pb-1 sm:pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {steps[currentStep].icon}
              <div>
                <DialogTitle className="text-base sm:text-lg text-slate-900">
                  {steps[currentStep].title}
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-slate-600">
                  {steps[currentStep].subtitle}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 text-center mt-0.5 sm:mt-1">
            Step {currentStep + 1} of {steps.length}
          </div>
        </DialogHeader>

        <div className="py-2 sm:py-3">{steps[currentStep].content}</div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2 sm:pt-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 sm:gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
