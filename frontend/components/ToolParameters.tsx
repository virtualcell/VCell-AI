"use client"

import { useState } from "react"
import { Settings, RotateCcw, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ChatParameters {
  bmName: string
  category: string
  owner: string
  savedLow: string
  savedHigh: string
  maxRows: number
  orderBy: string
  biomodelId: string
  llmMode: string
}

interface ToolParametersProps {
  parameters: ChatParameters
  onParametersChange: (parameters: ChatParameters) => void
}

export function ToolParameters({ parameters, onParametersChange }: ToolParametersProps) {
  const [showLLMParams, setShowLLMParams] = useState(true)
  const [showSearchParams, setShowSearchParams] = useState(true)
  const [showAdvancedParams, setShowAdvancedParams] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  const updateParameter = (key: keyof ChatParameters, value: any) => {
    onParametersChange({ ...parameters, [key]: value })
  }

  const clearAllParameters = () => {
    onParametersChange({
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
    setConfirmationMessage("Parameters have been cleared")
    setTimeout(() => setConfirmationMessage(""), 3000)
  }

  const saveParameters = () => {
    setConfirmationMessage("Parameters have been saved")
    setTimeout(() => setConfirmationMessage(""), 3000)
  }

  return (
    <div className="space-y-4">
      {/* LLM Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-sm">
        <Collapsible open={showLLMParams} onOpenChange={setShowLLMParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4">
              <CardTitle className="flex items-center justify-between text-slate-900 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  LLM Parameters
                </div>
                <div className="text-xs text-slate-500">{showLLMParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-sm text-slate-600">LLM Mode</Label>
                <RadioGroup
                  value={parameters.llmMode || "tool_calling"}
                  onValueChange={(value) => updateParameter("llmMode" as any, value)}
                  className="flex flex-row gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tool_calling" id="llm-tool-calling" className="h-4 w-4" />
                    <Label htmlFor="llm-tool-calling" className="text-sm text-slate-700 cursor-pointer">
                      Tool Calling
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json_analysis" id="llm-json-analysis" className="h-4 w-4" />
                    <Label htmlFor="llm-json-analysis" className="text-sm text-slate-700 cursor-pointer">
                      JSON Analysis
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-1 flex items-center gap-2">
                <Label htmlFor="maxRows" className="text-sm text-slate-600">
                  Max Results
                </Label>
                <Input
                  id="maxRows"
                  type="number"
                  max="1000"
                  value={parameters.maxRows}
                  onChange={(e) => updateParameter("maxRows", Number.parseInt(e.target.value) || 10)}
                  className="h-7 text-sm border-slate-300 px-3 w-20"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Search Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-sm">
        <Collapsible open={showSearchParams} onOpenChange={setShowSearchParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4">
              <CardTitle className="flex items-center justify-between text-slate-900 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Search Parameters
                </div>
                <div className="text-xs text-slate-500">{showSearchParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 space-y-3">
              {/* Search Parameters */}
              <div className="space-y-1">
                <div className="space-y-1">
                  <Label htmlFor="biomodelId" className="text-sm text-slate-600">
                    Biomodel ID
                  </Label>
                  <Input
                    id="biomodelId"
                    placeholder="Enter biomodel id..."
                    value={parameters.biomodelId}
                    onChange={(e) => updateParameter("biomodelId", e.target.value)}
                    className="h-7 text-sm border-slate-300 px-3"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="owner" className="text-sm text-slate-600">
                    Owner
                  </Label>
                  <Input
                    id="owner"
                    placeholder="Enter owner name..."
                    value={parameters.owner}
                    onChange={(e) => updateParameter("owner", e.target.value)}
                    className="h-7 text-sm border-slate-300 px-3"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bmName" className="text-sm text-slate-600">
                    Model Name
                  </Label>
                  <Input
                    id="bmName"
                    placeholder="Enter model name..."
                    value={parameters.bmName}
                    onChange={(e) => updateParameter("bmName", e.target.value)}
                    className="h-7 text-sm border-slate-300 px-3"
                  />
                </div>
                <div className="space-y-2">
                  <RadioGroup
                    value={parameters.category}
                    onValueChange={(value) => updateParameter("category", value)}
                    className="flex flex-row flex-wrap gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" className="h-4 w-4" />
                      <Label htmlFor="all" className="text-sm text-slate-700 cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" className="h-4 w-4" />
                      <Label htmlFor="public" className="text-sm text-slate-700 cursor-pointer">
                        Public
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tutorial" id="tutorial" className="h-4 w-4" />
                      <Label htmlFor="tutorial" className="text-sm text-slate-700 cursor-pointer">
                        Tutorial
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="educational" id="educational" className="h-4 w-4" />
                      <Label htmlFor="educational" className="text-sm text-slate-700 cursor-pointer">
                        Educational
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Advanced Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-sm">
        <Collapsible open={showAdvancedParams} onOpenChange={setShowAdvancedParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4">
              <CardTitle className="flex items-center justify-between text-slate-900 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Parameters
                </div>
                <div className="text-xs text-slate-500">{showAdvancedParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="savedLow" className="text-xs text-slate-600">
                    Saved After
                  </Label>
                  <Input
                    id="savedLow"
                    type="date"
                    value={parameters.savedLow}
                    onChange={(e) => updateParameter("savedLow", e.target.value)}
                    className="h-7 text-xs border-slate-300 px-3 w-28"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="savedHigh" className="text-xs text-slate-600">
                    Saved Before
                  </Label>
                  <Input
                    id="savedHigh"
                    type="date"
                    value={parameters.savedHigh}
                    onChange={(e) => updateParameter("savedHigh", e.target.value)}
                    className="h-7 text-xs border-slate-300 px-3 w-28"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="orderBy" className="text-sm text-slate-600">
                  Sort By
                </Label>
                <Select value={parameters.orderBy} onValueChange={(value) => updateParameter("orderBy", value)}>
                  <SelectTrigger className="h-7 text-sm border-slate-300 px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                    <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={saveParameters}
          className="text-slate-600 hover:text-slate-900 h-7 px-3 text-sm"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearAllParameters}
          className="text-slate-600 hover:text-slate-900 h-7 px-3 text-sm"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className="flex justify-center mt-2">
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-md text-xs font-medium">
            {confirmationMessage}
          </div>
        </div>
      )}
    </div>
  )
}
