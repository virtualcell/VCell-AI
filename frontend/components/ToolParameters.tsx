"use client"

import { useState } from "react"
import { Settings, RotateCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
}

interface ToolParametersProps {
  parameters: ChatParameters
  onParametersChange: (parameters: ChatParameters) => void
}

export function ToolParameters({ parameters, onParametersChange }: ToolParametersProps) {
  const [showParameters, setShowParameters] = useState(true)

  const updateParameter = (key: keyof ChatParameters, value: any) => {
    onParametersChange({ ...parameters, [key]: value })
  }

  const clearAllParameters = () => {
    onParametersChange({
      bmName: "",
      category: "all",
      owner: "",
      savedLow: "",
      savedHigh: "",
      maxRows: 100,
      orderBy: "date_desc",
    })
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <Collapsible open={showParameters} onOpenChange={setShowParameters}>
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-slate-900 text-base font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tool Parameters
              </div>
              <div className="text-xs text-slate-500">{showParameters ? "Hide" : "Show"}</div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-6">
            {/* Search Parameters */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="bmName" className="text-sm text-slate-600">
                  Model Name
                </Label>
                <Input
                  id="bmName"
                  placeholder="Enter model name..."
                  value={parameters.bmName}
                  onChange={(e) => updateParameter("bmName", e.target.value)}
                  className="h-8 text-sm border-slate-300"
                />
              </div>

              <div className="space-y-3">
                <RadioGroup
                  value={parameters.category}
                  onValueChange={(value) => updateParameter("category", value)}
                  className="flex flex-row flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="text-sm text-slate-700 cursor-pointer">
                      All
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="text-sm text-slate-700 cursor-pointer">
                      Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shared" id="shared" />
                    <Label htmlFor="shared" className="text-sm text-slate-700 cursor-pointer">
                      Shared
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tutorial" id="tutorial" />
                    <Label htmlFor="tutorial" className="text-sm text-slate-700 cursor-pointer">
                      Tutorial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="educational" id="educational" />
                    <Label htmlFor="educational" className="text-sm text-slate-700 cursor-pointer">
                      Educational
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner" className="text-sm text-slate-600">
                  Owner
                </Label>
                <Input
                  id="owner"
                  placeholder="Enter owner name..."
                  value={parameters.owner}
                  onChange={(e) => updateParameter("owner", e.target.value)}
                  className="h-8 text-sm border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="savedLow" className="text-xs text-slate-600">
                    Saved After
                  </Label>
                  <Input
                    id="savedLow"
                    type="date"
                    value={parameters.savedLow}
                    onChange={(e) => updateParameter("savedLow", e.target.value)}
                    className="h-8 text-xs border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savedHigh" className="text-xs text-slate-600">
                    Saved Before
                  </Label>
                  <Input
                    id="savedHigh"
                    type="date"
                    value={parameters.savedHigh}
                    onChange={(e) => updateParameter("savedHigh", e.target.value)}
                    className="h-8 text-xs border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderBy" className="text-sm text-slate-600">
                  Sort By
                </Label>
                <Select value={parameters.orderBy} onValueChange={(value) => updateParameter("orderBy", value)}>
                  <SelectTrigger className="h-8 text-sm border-slate-300">
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

              <div className="space-y-2">
                <Label htmlFor="maxRows" className="text-sm text-slate-600">
                  Max Results
                </Label>
                <Input
                  id="maxRows"
                  type="number"
                  min="1"
                  max="100"
                  value={parameters.maxRows}
                  onChange={(e) => updateParameter("maxRows", Number.parseInt(e.target.value) || 10)}
                  className="h-8 text-sm border-slate-300"
                />
              </div>
            </div>
            {/* Clear All Button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllParameters}
                className="text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
