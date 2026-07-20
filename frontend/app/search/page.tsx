"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronsUpDown,
  Lock,
  Globe,
  User,
  Calendar,
  FlaskConical,
  Hash,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchFilters {
  bmId: string;
  bmName: string;
  category: string;
  owner: string;
  savedLow: string;
  savedHigh: string;
  startRow: number;
  maxRows: number;
  orderBy: string;
}

interface BiomodelResult {
  bmId: number;
  name: string;
  ownerName: string;
  ownerKey: number;
  savedDate: string;
  annot: string;
  branchId: number;
  modelKey: number;
  simulations: number;
  privacy: number;
  groupUsers: string[];
}

const categoryOptions = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "shared", label: "Shared" },
  { value: "tutorial", label: "Tutorial" },
  { value: "educational", label: "Educational" },
];

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
  });

  const [results, setResults] = useState<BiomodelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Build query params from filters, omitting empty bmName
      const params = new URLSearchParams();
      if (filters.bmName) params.append("bmName", filters.bmName);
      if (filters.bmId) params.append("bmId", filters.bmId);
      params.append("category", filters.category);
      if (filters.owner) params.append("owner", filters.owner);
      if (filters.savedLow) params.append("savedLow", filters.savedLow);
      if (filters.savedHigh) params.append("savedHigh", filters.savedHigh);
      params.append("startRow", filters.startRow.toString());
      params.append("maxRows", filters.maxRows.toString());
      params.append("orderBy", filters.orderBy);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/biomodel?${params.toString()}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch biomodels");
      const data = await res.json();
      // Map API response to BiomodelResult[]
      const mappedResults: BiomodelResult[] = (data.data || []).map(
        (model: any) => ({
          bmId: Number(model.bmKey),
          name: model.name,
          ownerName: model.ownerName,
          ownerKey: Number(model.ownerKey),
          savedDate: new Date(model.savedDate).toISOString(),
          annot: model.annot || "", // fallback if missing
          branchId: Number(model.branchID),
          modelKey: Number(model.modelKey),
          simulations: Array.isArray(model.simulations)
            ? model.simulations.length
            : 0,
          privacy: model.privacy ?? 0,
          groupUsers: model.groupUsers || [],
        }),
      );
      setResults(mappedResults);
    } catch (err) {
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Biomodel Database Search
            </h1>
            <p className="text-slate-600 mt-1">
              Search and explore biomodels from the VCell database with advanced
              filtering options.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-blue-900 text-base font-bold">
              <Filter className="h-4 w-4 text-blue-500" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="bmName"
                  className="text-slate-700 font-medium text-sm"
                >
                  Model Name
                </Label>
                <Input
                  id="bmName"
                  placeholder="Enter biomodel name..."
                  value={filters.bmName}
                  onChange={(e) =>
                    setFilters({ ...filters, bmName: e.target.value })
                  }
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="owner"
                  className="text-slate-700 font-medium text-sm"
                >
                  Owner
                </Label>
                <Input
                  id="owner"
                  placeholder="Enter owner name..."
                  value={filters.owner}
                  onChange={(e) =>
                    setFilters({ ...filters, owner: e.target.value })
                  }
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="bmId"
                  className="text-slate-700 font-medium text-sm"
                >
                  Biomodel ID
                </Label>
                <Input
                  id="bmId"
                  placeholder="Enter biomodel ID..."
                  value={filters.bmId}
                  onChange={(e) =>
                    setFilters({ ...filters, bmId: e.target.value })
                  }
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="maxRows"
                  className="text-slate-700 font-medium text-sm"
                >
                  Max Results
                </Label>
                <Input
                  id="maxRows"
                  type="number"
                  min="1"
                  max="100"
                  value={filters.maxRows}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxRows: Number.parseInt(e.target.value) || 10,
                    })
                  }
                  className="border-slate-300 focus:border-blue-500 h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <Label className="text-slate-700 font-medium text-sm">
                Category
              </Label>
              <RadioGroup
                value={filters.category}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
                className="flex flex-wrap gap-2 pt-0.5"
              >
                {categoryOptions.map((cat) => (
                  <div key={cat.value}>
                    <RadioGroupItem
                      value={cat.value}
                      id={`cat-${cat.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`cat-${cat.value}`}
                      className="cursor-pointer select-none inline-flex px-3 py-1.5 rounded-full text-sm font-medium border border-slate-300 text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-700 peer-data-[state=checked]:bg-blue-600 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-white peer-data-[state=checked]:hover:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2"
                    >
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Collapsible
              open={isAdvancedSearchOpen}
              onOpenChange={setIsAdvancedSearchOpen}
              className="mt-4"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ChevronsUpDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isAdvancedSearchOpen && "rotate-180",
                    )}
                  />
                  {isAdvancedSearchOpen
                    ? "Hide Advanced Search"
                    : "Advanced Search"}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1">
                    <Label
                      htmlFor="savedLow"
                      className="text-slate-700 font-medium text-sm"
                    >
                      Saved After
                    </Label>
                    <Input
                      id="savedLow"
                      type="date"
                      value={filters.savedLow}
                      onChange={(e) =>
                        setFilters({ ...filters, savedLow: e.target.value })
                      }
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="savedHigh"
                      className="text-slate-700 font-medium text-sm"
                    >
                      Saved Before
                    </Label>
                    <Input
                      id="savedHigh"
                      type="date"
                      value={filters.savedHigh}
                      onChange={(e) =>
                        setFilters({ ...filters, savedHigh: e.target.value })
                      }
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="orderBy"
                      className="text-slate-700 font-medium text-sm"
                    >
                      Sort By
                    </Label>
                    <Select
                      value={filters.orderBy}
                      onValueChange={(value) =>
                        setFilters({ ...filters, orderBy: value })
                      }
                    >
                      <SelectTrigger className="border-slate-300 focus:border-blue-500 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">
                          Date (Newest First)
                        </SelectItem>
                        <SelectItem value="date_asc">
                          Date (Oldest First)
                        </SelectItem>
                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="startRow"
                      className="text-slate-700 font-medium text-sm"
                    >
                      Start Row
                    </Label>
                    <Input
                      id="startRow"
                      type="number"
                      min="1"
                      value={filters.startRow}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          startRow: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      className="border-slate-300 focus:border-blue-500 h-9"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 shadow-sm hover:shadow-md transition-all"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Section */}
        {!isLoading && results.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Search Results
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {results.length} model{results.length === 1 ? "" : "s"} found
              </Badge>
            </div>

            <div className="grid gap-4">
              {results.map((model) => (
                <Link
                  key={model.bmId}
                  href={`/search/${model.bmId}`}
                  className="block group"
                >
                  <Card className="shadow-sm border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            model.privacy === 1 ? "bg-red-50" : "bg-green-50",
                          )}
                        >
                          {model.privacy === 1 ? (
                            <Lock className="h-5 w-5 text-red-500" />
                          ) : (
                            <Globe className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {model.name}
                            </h3>
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1.5" />
                          </div>
                          <p className="text-slate-600 text-sm mt-1 mb-3 leading-relaxed line-clamp-2">
                            {model.annot || "No description available."}
                          </p>

                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {model.ownerName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {formatDate(model.savedDate)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FlaskConical className="h-3.5 w-3.5 text-slate-400" />
                              {model.simulations} simulation
                              {model.simulations === 1 ? "" : "s"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 text-slate-400" />
                              {model.bmId}
                            </span>
                          </div>

                          {model.groupUsers.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-slate-500 mr-1">
                                Shared with:
                              </span>
                              {model.groupUsers.map((user, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs font-normal border-slate-300 text-slate-600"
                                >
                                  {user}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state: searched but nothing matched */}
        {!isLoading && hasSearched && results.length === 0 && (
          <Card className="border-slate-200 border-dashed shadow-none">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No biomodels found
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Try adjusting your filters, or search with a different name,
                owner, or biomodel ID.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial state: no search performed yet */}
        {!isLoading && !hasSearched && (
          <Card className="border-slate-200 border-dashed shadow-none">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FlaskConical className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Start exploring biomodels
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Use the filters above to search VCell's biomodel database by
                name, owner, or category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
