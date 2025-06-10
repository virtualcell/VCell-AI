import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"

interface ChatParameters {
  bmName: string
  category: string
  owner: string
  savedLow: string
  savedHigh: string
  startRow: number
  maxRows: number
  orderBy: string
}

interface ToolParametersProps {
  parameters: ChatParameters
  updateParameter: (key: keyof ChatParameters, value: any) => void
  showParameters: boolean
  setShowParameters: (open: boolean) => void
}

const ToolParameters: React.FC<ToolParametersProps> = ({
  parameters,
  updateParameter,
  showParameters,
  setShowParameters,
}) => {
  return (
    <Card className="shadow-sm border-slate-200">
      <Collapsible open={showParameters} onOpenChange={setShowParameters}>
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-slate-900">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tool Parameters
              </div>
              <div className="text-xs text-slate-500">{showParameters ? "Hide" : "Show"}</div>
            </CardTitle>
            <CardDescription>Configure search and retrieval parameters</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-6">
            {/* Search Parameters */}
            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">Search Parameters</Label>

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

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm text-slate-600">
                  Category
                </Label>
                <Select
                  value={parameters.category}
                  onValueChange={(value) => updateParameter("category", value)}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="startRow" className="text-xs text-slate-600">
                    Start Row
                  </Label>
                  <Input
                    id="startRow"
                    type="number"
                    min="1"
                    value={parameters.startRow}
                    onChange={(e) => updateParameter("startRow", Number.parseInt(e.target.value) || 1)}
                    className="h-8 text-xs border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRows" className="text-xs text-slate-600">
                    Max Results
                  </Label>
                  <Input
                    id="maxRows"
                    type="number"
                    min="1"
                    max="100"
                    value={parameters.maxRows}
                    onChange={(e) => updateParameter("maxRows", Number.parseInt(e.target.value) || 10)}
                    className="h-8 text-xs border-slate-300"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default ToolParameters
