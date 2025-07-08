"use client"

import { useState } from "react"
import { Search, Filter, Download, Eye, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SearchFilters {
  bmId: string
  bmName: string
  category: string
  owner: string
  savedLow: string
  savedHigh: string
  startRow: number
  maxRows: number
  orderBy: string
}

interface BiomodelResult {
  bmId: number
  name: string
  ownerName: string
  ownerKey: number
  savedDate: string
  annot: string
  branchId: number
  modelKey: number
  simulations: number
  privacy: number
  groupUsers: string[]
}

export default function BiomodelSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    bmId: "",
    bmName: "",
    category: "all",
    owner: "",
    savedLow: "",
    savedHigh: "",
    startRow: 1,
    maxRows: 1000,
    orderBy: "date_desc",
  })

  const [results, setResults] = useState<BiomodelResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)

    // Mock API response for demonstration
    const mockResponse = {
      bioModelInfos: [
        {
          bmId: 123456789,
          name: "Cardiac Myocyte Calcium Dynamics",
          ownerName: "Dr. Smith",
          ownerKey: 987654321,
          savedDate: "2024-01-15T10:30:00Z",
          annot:
            "A comprehensive model of calcium handling in cardiac myocytes including L-type calcium channels, ryanodine receptors, and SERCA pumps.",
          branchId: 1,
          modelKey: 456789123,
          simulations: 15,
          privacy: 1,
          groupUsers: ["researcher1", "researcher2"],
        },
        {
          bmId: 987654321,
          name: "Neural Network Synaptic Transmission",
          ownerName: "Prof. Johnson",
          ownerKey: 123456789,
          savedDate: "2024-01-10T14:20:00Z",
          annot:
            "Mathematical model describing neurotransmitter release and postsynaptic receptor dynamics in central nervous system synapses.",
          branchId: 2,
          modelKey: 789123456,
          simulations: 8,
          privacy: 0,
          groupUsers: [],
        },
        {
          bmId: 456789123,
          name: "Metabolic Pathway Regulation",
          ownerName: "Dr. Williams",
          ownerKey: 654321987,
          savedDate: "2024-01-05T09:15:00Z",
          annot:
            "Detailed kinetic model of glycolysis and gluconeogenesis pathways with allosteric regulation mechanisms.",
          branchId: 1,
          modelKey: 321987654,
          simulations: 22,
          privacy: 1,
          groupUsers: ["student1", "postdoc1", "collaborator1"],
        },
      ],
      totalCount: 3,
    }

    // Simulate API delay
    setTimeout(() => {
      setResults(mockResponse.bioModelInfos)
      setIsLoading(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Biomodel Database Search</h1>
          <p className="text-slate-600">
            Search and explore biomodels from the VCell database with advanced filtering options.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 text-base">
              <Filter className="h-4 w-4" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <Label htmlFor="bmName" className="text-slate-700 font-medium text-sm">
                  Model Name
                </Label>
                <Input
                  id="bmName"
                  placeholder="Enter biomodel name..."
                  value={filters.bmName}
                  onChange={(e) => setFilters({ ...filters, bmName: e.target.value })}
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="owner" className="text-slate-700 font-medium text-sm">
                  Owner
                </Label>
                <Input
                  id="owner"
                  placeholder="Enter owner name..."
                  value={filters.owner}
                  onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bmId" className="text-slate-700 font-medium text-sm">
                  Biomodel ID
                </Label>
                <Input
                  id="bmId"
                  placeholder="Enter biomodel ID..."
                  value={filters.bmId}
                  onChange={(e) => setFilters({ ...filters, bmId: e.target.value })}
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxRows" className="text-slate-700 font-medium text-sm">
                  Max Results
                </Label>
                <Input
                  id="maxRows"
                  type="number"
                  min="1"
                  max="100"
                  value={filters.maxRows}
                  onChange={(e) => setFilters({ ...filters, maxRows: Number.parseInt(e.target.value) || 10 })}
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700 font-medium text-sm">Category</Label>
                <RadioGroup
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                  className="flex flex-wrap gap-x-4 gap-y-1 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="cat-all" />
                    <Label htmlFor="cat-all" className="font-normal">
                      All
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="cat-public" />
                    <Label htmlFor="cat-public" className="font-normal">
                      Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shared" id="cat-shared" />
                    <Label htmlFor="cat-shared" className="font-normal">
                      Shared
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tutorial" id="cat-tutorial" />
                    <Label htmlFor="cat-tutorial" className="font-normal">
                      Tutorial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="educational" id="cat-educational" />
                    <Label htmlFor="cat-educational" className="font-normal">
                      Educational
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <Collapsible open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 text-blue-600 hover:text-blue-700 text-sm">
                  <ChevronsUpDown className="h-4 w-4 mr-1" />
                  Advanced Search
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="savedLow" className="text-slate-700 font-medium text-sm">
                      Saved After
                    </Label>
                    <Input
                      id="savedLow"
                      type="date"
                      value={filters.savedLow}
                      onChange={(e) => setFilters({ ...filters, savedLow: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="savedHigh" className="text-slate-700 font-medium text-sm">
                      Saved Before
                    </Label>
                    <Input
                      id="savedHigh"
                      type="date"
                      value={filters.savedHigh}
                      onChange={(e) => setFilters({ ...filters, savedHigh: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="orderBy" className="text-slate-700 font-medium text-sm">
                      Sort By
                    </Label>
                    <Select value={filters.orderBy} onValueChange={(value) => setFilters({ ...filters, orderBy: value })}>
                      <SelectTrigger className="border-slate-300 focus:border-blue-500 h-9">
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

                  <div className="space-y-1">
                    <Label htmlFor="startRow" className="text-slate-700 font-medium text-sm">
                      Start Row
                    </Label>
                    <Input
                      id="startRow"
                      type="number"
                      min="1"
                      value={filters.startRow}
                      onChange={(e) => setFilters({ ...filters, startRow: Number.parseInt(e.target.value) || 1 })}
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Search Results</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {results.length} models found
              </Badge>
            </div>

            <div className="grid gap-4">
              {results.map((model) => (
                <Card key={model.bmId} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{model.name}</h3>
                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">{model.annot}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>
                            <strong>Owner:</strong> {model.ownerName}
                          </span>
                          <span>
                            <strong>Saved:</strong> {formatDate(model.savedDate)}
                          </span>
                          <span>
                            <strong>Simulations:</strong> {model.simulations}
                          </span>
                          <span>
                            <strong>Model ID:</strong> {model.bmId}
                          </span>
                        </div>

                        {model.groupUsers.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm text-slate-500 mr-2">Shared with:</span>
                            {model.groupUsers.map((user, index) => (
                              <Badge key={index} variant="outline" className="mr-1 text-xs">
                                {user}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant={model.privacy === 1 ? "default" : "secondary"}>
                          {model.privacy === 1 ? "Private" : "Public"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
