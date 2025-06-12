"use client"

import { useState } from "react"
import { Settings, RotateCcw } from 'lucide-react'
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
      llmMode: "tool_calling", // new param for LLM mode
    })
  }

  return (
    <div className="space-y-3">
      {/* LLM Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-xs">
        <Collapsible open={showLLMParams} onOpenChange={setShowLLMParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3">
              <CardTitle className="flex items-center justify-between text-slate-900 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  LLM Parameters
                </div>
                <div className="text-[10px] text-slate-500">{showLLMParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-2 space-y-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">LLM Mode</Label>
                <RadioGroup
                  value={parameters.llmMode || "tool_calling"}
                  onValueChange={(value) => updateParameter("llmMode" as any, value)}
                  className="flex flex-row gap-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="tool_calling" id="llm-tool-calling" className="h-3 w-3" />
                    <Label htmlFor="llm-tool-calling" className="text-xs text-slate-700 cursor-pointer">
                      LLM with Tool Calling
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="json_analysis" id="llm-json-analysis" className="h-3 w-3" />
                    <Label htmlFor="llm-json-analysis" className="text-xs text-slate-700 cursor-pointer">
                      LLM with JSON Analysis
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="maxRows" className="text-xs text-slate-600">
                  Max Results
                </Label>
                <Input
                  id="maxRows"
                  type="number"
                  max="1000"
                  value={parameters.maxRows}
                  onChange={(e) => updateParameter("maxRows", Number.parseInt(e.target.value) || 10)}
                  className="h-6 text-xs border-slate-300 px-2"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Search Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-xs">
        <Collapsible open={showSearchParams} onOpenChange={setShowSearchParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3">
              <CardTitle className="flex items-center justify-between text-slate-900 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Search Parameters
                </div>
                <div className="text-[10px] text-slate-500">{showSearchParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-2 space-y-2">
              {/* Search Parameters */}
              <div className="space-y-0.5">
                <div className="space-y-0.5">
                  <Label htmlFor="biomodelId" className="text-xs text-slate-600">
                    Biomodel ID
                  </Label>
                  <Input
                    id="biomodelId"
                    placeholder="Enter biomodel id..."
                    value={parameters.biomodelId}
                    onChange={(e) => updateParameter("biomodelId", e.target.value)}
                    className="h-6 text-xs border-slate-300 px-2"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="bmName" className="text-xs text-slate-600">
                    Model Name
                  </Label>
                  <Input
                    id="bmName"
                    placeholder="Enter model name..."
                    value={parameters.bmName}
                    onChange={(e) => updateParameter("bmName", e.target.value)}
                    className="h-6 text-xs border-slate-300 px-2"
                  />
                </div>
                <div className="space-y-1">
                  <RadioGroup
                    value={parameters.category}
                    onValueChange={(value) => updateParameter("category", value)}
                    className="flex flex-row flex-wrap gap-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="all" id="all" className="h-3 w-3" />
                      <Label htmlFor="all" className="text-xs text-slate-700 cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="public" id="public" className="h-3 w-3" />
                      <Label htmlFor="public" className="text-xs text-slate-700 cursor-pointer">
                        Public
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="tutorial" id="tutorial" className="h-3 w-3" />
                      <Label htmlFor="tutorial" className="text-xs text-slate-700 cursor-pointer">
                        Tutorial
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="educational" id="educational" className="h-3 w-3" />
                      <Label htmlFor="educational" className="text-xs text-slate-700 cursor-pointer">
                        Educational
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="owner" className="text-xs text-slate-600">
                    Owner
                  </Label>
                  <Input
                    id="owner"
                    placeholder="Enter owner name..."
                    value={parameters.owner}
                    onChange={(e) => updateParameter("owner", e.target.value)}
                    className="h-6 text-xs border-slate-300 px-2"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Advanced Parameters Panel */}
      <Card className="shadow-sm border-slate-200 text-xs">
        <Collapsible open={showAdvancedParams} onOpenChange={setShowAdvancedParams}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors py-2 px-3">
              <CardTitle className="flex items-center justify-between text-slate-900 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Advanced Parameters
                </div>
                <div className="text-[10px] text-slate-500">{showAdvancedParams ? "Hide" : "Show"}</div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="savedLow" className="text-[10px] text-slate-600">
                    Saved After
                  </Label>
                  <Input
                    id="savedLow"
                    type="date"
                    value={parameters.savedLow}
                    onChange={(e) => updateParameter("savedLow", e.target.value)}
                    className="h-6 text-[10px] border-slate-300 px-2"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="savedHigh" className="text-[10px] text-slate-600">
                    Saved Before
                  </Label>
                  <Input
                    id="savedHigh"
                    type="date"
                    value={parameters.savedHigh}
                    onChange={(e) => updateParameter("savedHigh", e.target.value)}
                    className="h-6 text-[10px] border-slate-300 px-2"
                  />
                </div>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="orderBy" className="text-xs text-slate-600">
                  Sort By
                </Label>
                <Select value={parameters.orderBy} onValueChange={(value) => updateParameter("orderBy", value)}>
                  <SelectTrigger className="h-6 text-xs border-slate-300 px-2">
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

      {/* Clear All Button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={clearAllParameters}
          className="text-slate-600 hover:text-slate-900 h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>
    </div>
  )
}
