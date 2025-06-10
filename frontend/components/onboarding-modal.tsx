"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Natural Language Queries",
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4">
              <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ask questions in plain English!</h3>
              <p className="text-slate-600">
                The AI Assistant understands natural language. Just type your questions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-medium">Try asking questions like:</Label>
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <MessageSquare className="h-3 w-3" />
                  Example Query
                </div>
                <div className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded">
                  "List all calcium models by Juliajessica"
                </div>
              </div>
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
              <Label className="text-sm text-slate-600 mb-2 block">Try it yourself:</Label>
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
      title: "Hybrid Mode with Parameters",
      subtitle: "Combine natural language with specific filters",
      icon: <Settings className="h-8 w-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-4">
              <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Parameter Filtering</h3>
              <p className="text-slate-600">
                Set specific parameters to narrow down your searches and avoid repeating the same criteria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">Use Case Example:</Label>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-sm text-amber-800 mb-2 font-medium">Scenario:</div>
                <p className="text-sm text-amber-700">
                  You're researching calcium models and want to ask multiple questions about tutorial models only.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Instead of asking:</div>
                <div className="bg-slate-100 p-2 rounded text-xs font-mono">
                  "Find tutorial calcium models"
                  <br />
                  "Show tutorial models about calcium that use the Combined Stiff Solver"
                  <br />
                  "Get tutorial calcium models from Juliajessica"
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">Better Approach:</Label>

              {/* Mock Tool Parameters */}
              <Card className="border-slate-200 p-2 sm:p-3 text-xs">
                <CardHeader className="bg-slate-50 border-b border-slate-200 py-2 sm:py-2.5 text-xs">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Tool Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Model Type</Label>
                    <RadioGroup value="tutorial" className="grid grid-cols-1 gap-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tutorial" id="tutorial-demo" />
                        <Label htmlFor="tutorial-demo" className="text-xs text-slate-700 cursor-pointer">
                          Tutorial ✓
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Model Name</Label>
                    <Input placeholder="calcium" value="calcium" className="h-7 text-xs border-slate-300" disabled />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <div className="text-sm text-slate-600">Now simply ask:</div>
                <div className="bg-green-100 p-2 rounded text-xs font-mono">
                  "Find all models"
                  <br />
                  "Show models that use Combined Stiff Solver"
                  <br />
                  "Get models from Juliajessica"
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Available Tools",
      subtitle: "Standalone tools and result verification",
      icon: <Search className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4">
              <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Powerful Analysis Tools</h3>
              <p className="text-slate-600">
                Use these tools independently or to verify AI responses for accurate results.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Biomodel Search</h4>
                    <p className="text-xs text-slate-600">Advanced filtering</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Search the database with precise filters for name, owner, category, and date ranges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">VCML Files</h4>
                    <p className="text-xs text-slate-600">Virtual Cell format</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Retrieve complete model definitions with compartments, species, and kinetics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">SBML Files</h4>
                    <p className="text-xs text-slate-600">Standard format</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Download standardized Systems Biology Markup Language files for external tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Diagram3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Diagrams</h4>
                    <p className="text-xs text-slate-600">Visual networks</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Generate real-time network diagrams showing topology and interactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Important Disclaimers",
      subtitle: "Understanding AI limitations",
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-4">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Response Limitations</h3>
              <p className="text-slate-600">
                Understanding these limitations ensures you use the AI Assistant effectively and safely.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-xl">🤖</span>
                  </div>
                  <h4 className="font-semibold text-red-900 mb-2">AI Hallucinations</h4>
                  <p className="text-sm text-red-800">AI may generate plausible-sounding but incorrect information</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 text-xl">⚠️</span>
                  </div>
                  <h4 className="font-semibold text-orange-900 mb-2">Server Errors</h4>
                  <p className="text-sm text-orange-800">
                    Technical issues may affect response accuracy or availability
                  </p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-yellow-600 text-xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Private Models</h4>
                  <p className="text-sm text-yellow-800">
                    Feature under development to access private models securely
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[70vh] p-2 sm:p-3 overflow-y-auto text-xs sm:text-sm">
        <DialogHeader className="border-b border-slate-200 pb-1 sm:pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {steps[currentStep].icon}
              <div>
                <DialogTitle className="text-base sm:text-lg text-slate-900">{steps[currentStep].title}</DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-slate-600">{steps[currentStep].subtitle}</DialogDescription>
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
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 sm:gap-2">
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs">
                Get Started
              </Button>
            ) : (
              <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
